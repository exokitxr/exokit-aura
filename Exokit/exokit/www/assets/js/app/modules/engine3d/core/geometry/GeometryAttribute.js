/**
 * @name GeometryAttribute
 * @param {Float32Array} array
 * @param {Number} itemSize
 * @param {Number} meshPerAttribute
 */
class GeometryAttribute {
    constructor(_array, _itemSize, _meshPerAttribute) {
        /**
         * @name array
         * @memberof GeometryAttribute
         * @property
         */
        this.array = _array;

        /**
         * @name itemSize
         * @memberof GeometryAttribute
         * @property
         */
        this.itemSize = _itemSize;

        /**
         * @name count
         * @memberof GeometryAttribute
         * @property
         */
        this.count = _array !== undefined ? _array.length / _itemSize : 0;

        /**
         * @name dynamic
         * @memberof GeometryAttribute
         * @property
         */
        this.dynamic = false;

        /**
         * @name updateRange
         * @memberof GeometryAttribute
         * @property
         */
        this.updateRange = {offset: 0, count: -1};

        this.meshPerAttribute = _meshPerAttribute;
    }

    setArray(array) {
        this.array = array;
        this.count = array !== undefined ? array.length / this.itemSize : 0;
        this.needsUpdate = true;
    }

    clone() {
        return new GeometryAttribute(new Float32Array(this.array), this.itemSize, this.meshPerAttribute);
    }
}