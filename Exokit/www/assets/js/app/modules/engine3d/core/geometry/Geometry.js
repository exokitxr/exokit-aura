/**
 * @name Geometry
 */
class Geometry {
    constructor() {
        this.attributes = {};
        this.boundingBox = null;
        this.boundingSphere = null;
        this.index = null;
        this.maxInstancedCount = undefined;
        this.keepAlive = false;
    }

    draw(mesh, shader) {
        Geometry.renderer.draw(this, mesh, shader);
    }

    upload(mesh, shader) {
        Geometry.renderer.upload(this, mesh, shader);
    }

    destroy(mesh) {
    	if (!this.keepAlive) Geometry.renderer.destroy(this, mesh);
    }

    /**
     * @name addAttribute()
     * @memberof Geometry
     *
     * @function
     * @param {String} name
     * @param {GeometryAttribute} attribute
     */
    addAttribute(name, attribute) {
        if (attribute.meshPerAttribute >= 1) {
        	this.isInstanced = true;
        	this.maxInstancedCount = attribute.count;
        }
        this.attributes[name] = attribute;
    }

    /**
     * @name setIndex()
     * @memberof Geometry
     *
     * @function
     * @param {Float32Array} array
     */
    setIndex(attribute) {
        if (attribute.array) this.index = attribute.array;
    }

    /**
     * @name toNonIndexed()
     * @memberof Geometry
     */
    toNonIndexed() {
        let geometry2 = new Geometry();

        let indices = this.index;
        let attributes = this.attributes;

        for (let name in attributes) {
            let attribute = attributes[ name ];
            let array = attribute.array;
            let itemSize = attribute.itemSize;
            let array2 = new array.constructor( indices.length * itemSize );
            let index = 0, index2 = 0;

            for (let i = 0, l = indices.length; i < l; i++) {
                index = indices[ i ] * itemSize;
                for ( let j = 0; j < itemSize; j ++ ) {
                    array2[ index2 ++ ] = array[ index ++ ];
                }
            }

            geometry2.addAttribute(name, new GeometryAttribute(array2, itemSize));
        }

        return geometry2;
    }

    /**
     * @name normalizeNormals()
     * @memberof Geometry
     */
    normalizeNormals() {
        let vector = this._V1 || new Vector3();
        this._V1 = vector;

        let normals = this.attributes.normal;
        let x, y, z;
        for (let i = 0, il = normals.count; i < il; i++) {
            x = i*3+0;
            y = i*3+1;
            z = i*3+2;
            vector.x = normals.array[x];
            vector.y = normals.array[y];
            vector.z = normals.array[z];
            vector.normalize();
            normals.array[x] = vector.x;
            normals.array[y] = vector.y;
            normals.array[z] = vector.z;
        }
	}

    /**
     * @name computeFaceNormals()
     * @memberof Geometry
     */
    computeFaceNormals() {
		let cb = new Vector3(), ab = new Vector3();
		for (let f = 0, fl = this.faces.length; f < fl; f++) {
			let face = this.faces[f];
			let vA = this.vertices[face.a];
			let vB = this.vertices[face.b];
			let vC = this.vertices[face.c];
			cb.subVectors(vC, vB);
			ab.subVectors(vA, vB);
			cb.cross(ab);
			cb.normalize();
			face.normal.copy(cb);
		}
	}

    /**
     * @name computeVertexNormals()
     * @memberof Geometry
     */
	computeVertexNormals() {
		let index = this.index;
		let attributes = this.attributes;
		let groups = this.groups;

		if ( attributes.position ) {
			let positions = attributes.position.array;
			if ( attributes.normal === undefined ) {
				this.addAttribute( 'normal', new BufferAttribute( new Float32Array( positions.length ), 3 ) );
			} else {
				let array = attributes.normal.array;
				for ( let i = 0, il = array.length; i < il; i ++ ) {
					array[ i ] = 0;
				}
            }

			let normals = attributes.normal.array;
			let vA, vB, vC;
			let pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			let cb = new Vector3(), ab = new Vector3();

			if ( index ) {
				let indices = index.array;
				if ( groups.length === 0 ) {
					this.addGroup( 0, indices.length );
				}

				for ( let j = 0, jl = groups.length; j < jl; ++ j ) {
					let group = groups[ j ];
					let start = group.start;
					let count = group.count;
					for ( let i = start, il = start + count; i < il; i += 3 ) {

						vA = indices[ i + 0 ] * 3;
						vB = indices[ i + 1 ] * 3;
						vC = indices[ i + 2 ] * 3;

						pA.fromArray( positions, vA );
						pB.fromArray( positions, vB );
						pC.fromArray( positions, vC );

						cb.subVectors( pC, pB );
						ab.subVectors( pA, pB );
						cb.cross( ab );

						normals[ vA ] += cb.x;
						normals[ vA + 1 ] += cb.y;
						normals[ vA + 2 ] += cb.z;

						normals[ vB ] += cb.x;
						normals[ vB + 1 ] += cb.y;
						normals[ vB + 2 ] += cb.z;

						normals[ vC ] += cb.x;
						normals[ vC + 1 ] += cb.y;
						normals[ vC + 2 ] += cb.z;
					}
				}
			} else {
				for ( let i = 0, il = positions.length; i < il; i += 9 ) {
					pA.fromArray( positions, i );
					pB.fromArray( positions, i + 3 );
					pC.fromArray( positions, i + 6 );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					normals[ i ] = cb.x;
					normals[ i + 1 ] = cb.y;
					normals[ i + 2 ] = cb.z;

					normals[ i + 3 ] = cb.x;
					normals[ i + 4 ] = cb.y;
					normals[ i + 5 ] = cb.z;

					normals[ i + 6 ] = cb.x;
					normals[ i + 7 ] = cb.y;
					normals[ i + 8 ] = cb.z;
				}
			}
			this.normalizeNormals();
			attributes.normal.needsUpdate = true;
		}
	}

    /**
     * @name computeBoundingBox()
     * @memberof Geometry
     */
	computeBoundingBox() {
    	if (!this.boundingBox) this.boundingBox = new Box3();

        let position = this.attributes.position;
        if ( position ) {
            this.boundingBox.setFromBufferAttribute(position);
        } else {
            this.boundingBox.makeEmpty();
        }
	}

    /**
     * @name computeBoundingSphere()
     * @memberof Geometry
     */
	computeBoundingSphere() {
        let box = new Box3();
        let vector = new Vector3();

		if (!this.boundingSphere) this.boundingSphere = new Sphere();

		let position = this.attributes.position;
		if (position) {
			let center = this.boundingSphere.center;

			box.setFromBufferAttribute(position);
			box.getCenter(center);

			let maxRadiusSq = 0;
			for ( let i = 0, il = position.count; i < il; i ++ ) {
				vector.x = position.array[i * 3 + 0];
				vector.y = position.array[i * 3 + 1];
				vector.z =  position.array[i * 3 + 2];
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
			}

			this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

			if (isNaN(this.boundingSphere.radius)) {
				console.error( 'Bounding Sphere came up NaN, broken position buffer.', this );
			}
		}
	}

    /**
     * @name merge()
     * @memberof Geometry
     *
     * @function
     * @param {Geometry} geometry
     */
	merge(geometry) {
        let Float32ArrayConcat = (first, second) => {
            let firstLength = first.length,
                result = new Float32Array(firstLength + second.length);

            result.set(first);
            result.set(second, firstLength);

            return result;
        };

        let Uint32ArrayConcat = (first, second) => {
            let firstLength = first.length,
                result = new Uint32Array(firstLength + second.length);

            result.set(first);
            result.set(second, firstLength);

            return result;
        };

        let attributes = this.attributes;

        if (this.index) {
            let indices = geometry.index.array;
            let offset = attributes[ 'position' ].count;
            for( let i = 0, il = indices.length; i < il; i++ ) {
                indices[i] = offset + indices[i];
            }

            this.index.array = Uint32ArrayConcat( this.index.array, indices );
            this.index.count = this.index.array.length / this.index.itemSize;
        }

        for ( let key in attributes ) {
            if ( geometry.attributes[ key ] === undefined ) continue;
            attributes[ key ].array = Float32ArrayConcat( attributes[ key ].array, geometry.attributes[ key ].array );
            attributes[key].count = attributes[key].array.length / attributes[key].itemSize;
        }

        return this;
	}

    /**
     * @name clone()
     * @memberof Geometry
     */
	clone() {
    	return new Geometry().copy(this);
	}

	copy(source) {
        this.index = null;
        this.attributes = {};
        this.boundingBox = null;
        this.boundingSphere = null;
        this.index = source.index;

        let attributes = source.attributes;
        for (let name in attributes) {
            this.addAttribute(name, attributes[name].clone());
        }

        let boundingBox = source.boundingBox;
        if (boundingBox) this.boundingBox = boundingBox.clone();

        let boundingSphere = source.boundingSphere;
        if (boundingSphere) this.boundingSphere = boundingSphere.clone();

        return this;
	}

    /**
     * @name center()
     * @memberof Geometry
     */
	center() {
		let offset = new Vector3();
        this.computeBoundingBox();
        this.boundingBox.getCenter(offset).negate();
        this.applyMatrix(new Matrix4().makeTranslation(offset.x, offset.y, offset.z));
        return this;
	}

    /**
     * @name applyMatrix()
     * @memberof Geometry
     *
     * @function
     * @param {Matrix4} matrix
     */
	applyMatrix(matrix) {
        let position = this.attributes.position;

        if (position) {
            matrix.applyToBufferAttribute(position);
            position.needsUpdate = true;
        }

        let normal = this.attributes.normal;
        if (normal) {
            let normalMatrix = new Matrix3().getNormalMatrix(matrix);
            normalMatrix.applyToBufferAttribute(normal);
            normal.needsUpdate = true;
        }

        if (this.boundingBox) this.computeBoundingBox();
        if (this.boundingSphere) this.computeBoundingSphere();

        return this;
	}

    /**
     * @name scale()
     * @memberof Geometry
     *
     * @function
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
	scale(x, y, z) {
        this.applyMatrix(new Matrix4().makeScale(x, y, z));
    }

	setFromPoints(points) {
        let position = [];
        for (let i = 0, l = points.length; i < l; i++) {
            let point = points[i];
            position.push(point.x, point.y, point.z || 0);

        }
        this.addAttribute('position', new GeometryAttribute(new Float32Array(position), 3 ));

        return this;
    }
}