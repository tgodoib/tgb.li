/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			// 'wireframe'
			{
				wireframe: {
					// ...require('daisyui/src/theming/themes')['wireframe'],
					fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
					primary: '#b8b8b8',
					secondary: '#b8b8b8',
					accent: '#b8b8b8',
					neutral: '#ebebeb',
					success: '#008000',
					error: '#ff0000',
					'--rounded-box': '0.8rem',
					'--rounded-btn': '0.4rem',
					'--rounded-badge': '0.4rem',
					'--tab-radius': '0.4rem'
				}
			}
		]
	}
};
