import { mat4, vec3, vec4 } from 'gl-matrix';

export class Frustum {
    private planes: vec4[] = [];

    constructor(projectionMatrix: mat4, viewMatrix: mat4) {
        const pvMatrix = mat4.multiply(mat4.create(), projectionMatrix, viewMatrix);

        // Extract frustum planes
        this.planes = [
            vec4.fromValues(pvMatrix[3] - pvMatrix[0], pvMatrix[7] - pvMatrix[4], pvMatrix[11] - pvMatrix[8], pvMatrix[15] - pvMatrix[12]), // Left
            vec4.fromValues(pvMatrix[3] + pvMatrix[0], pvMatrix[7] + pvMatrix[4], pvMatrix[11] + pvMatrix[8], pvMatrix[15] + pvMatrix[12]), // Right
            vec4.fromValues(pvMatrix[3] - pvMatrix[1], pvMatrix[7] - pvMatrix[5], pvMatrix[11] - pvMatrix[9], pvMatrix[15] - pvMatrix[13]), // Bottom
            vec4.fromValues(pvMatrix[3] + pvMatrix[1], pvMatrix[7] + pvMatrix[5], pvMatrix[11] + pvMatrix[9], pvMatrix[15] + pvMatrix[13]), // Top
            vec4.fromValues(pvMatrix[3] - pvMatrix[2], pvMatrix[7] - pvMatrix[6], pvMatrix[11] - pvMatrix[10], pvMatrix[15] - pvMatrix[14]), // Near
            vec4.fromValues(pvMatrix[3] + pvMatrix[2], pvMatrix[7] + pvMatrix[6], pvMatrix[11] + pvMatrix[10], pvMatrix[15] + pvMatrix[14])  // Far
        ];

        // Normalize the planes
        this.planes.forEach(plane => {
            const length = Math.sqrt(plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2]);
            plane[0] /= length;
            plane[1] /= length;
            plane[2] /= length;
            plane[3] /= length;
        });
    }

    isBoxInFrustum(min: vec3, max: vec3): boolean {
        for (const plane of this.planes) {
            if (
                plane[0] * (plane[0] < 0 ? min[0] : max[0]) +
                plane[1] * (plane[1] < 0 ? min[1] : max[1]) +
                plane[2] * (plane[2] < 0 ? min[2] : max[2]) +
                plane[3] < 0
            ) {
                return false;
            }
        }
        return true;
    }
}