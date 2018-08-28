vec3 transformNormal(vec3 n, vec4 orientation) {
    vec3 ncN = cross(orientation.xyz, n);
    n = ncN * (2.0 * orientation.w) + (cross(orientation.xyz, ncN) * 2.0 + n);
    return n;
}

vec3 transformPosition(vec3 position, vec3 offset, vec3 scale, vec4 orientation) {
    vec3 pos = position;
    pos *= scale;

    pos = pos + 2.0 * cross(orientation.xyz, cross(orientation.xyz, pos) + orientation.w * pos);
    pos += offset;
    return pos;
}

vec3 transformPosition(vec3 position, vec3 offset, vec4 orientation) {
    vec3 pos = position;

    pos = pos + 2.0 * cross(orientation.xyz, cross(orientation.xyz, pos) + orientation.w * pos);
    pos += offset;
    return pos;
}

vec3 transformPosition(vec3 position, vec3 offset, float scale, vec4 orientation) {
    return transformPosition(position, offset, vec3(scale), orientation);
}

vec3 transformPosition(vec3 position, vec3 offset) {
    return position + offset;
}

vec3 transformPosition(vec3 position, vec3 offset, float scale) {
    vec3 pos = position * scale;
    return pos + offset;
}

vec3 transformPosition(vec3 position, vec3 offset, vec3 scale) {
    vec3 pos = position * scale;
    return pos + offset;
}