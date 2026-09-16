declare module 'three-raymarcher' {
	import {
		Color,
		Mesh,
		PlaneGeometry,
		Quaternion,
		RawShaderMaterial,
		Texture,
		Vector3,
	} from 'three';
	export type Entity = {
		color: Color;
		operation: number;
		position: Vector3;
		rotation: Quaternion;
		scale: Vector3;
		shape: number;
	};
	export default class Raymarcher extends Mesh<
		PlaneGeometry,
		RawShaderMaterial
	> {
		constructor(options?: {
			blending?: number;
			conetracing?: boolean;
			envMap?: Texture;
			envMapIntensity?: number;
			metalness?: number;
			layers?: Entity[][];
			resolution?: number;
			roughness?: number;
		});
		static shapes: Record<'sphere' | 'capsule' | 'box', number>;
		static operations: Record<
			'union' | 'substraction' | 'intersection',
			number
		>;
		userData: {
			blending: number;
			conetracing: boolean;
			envMap: Texture;
			envMapIntensity: number;
			metalness: number;
			layers: Entity[][];
			resolution: number;
			roughness: number;
			raymarcher: Mesh<PlaneGeometry, RawShaderMaterial>;
		};
		dispose(): void;
	}
}
