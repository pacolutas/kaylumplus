import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = () => {
	return {
		title: env.TITLE ?? 'KAYLUM ULTRA',
		slogan: env.SLOGAN ?? 'Una plataforma creada por el Colectivo AlterLab'
	};
};
