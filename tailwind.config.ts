
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				gray: {
					750: 'rgb(55 65 81 / 0.8)',
					950: '#0a0a0a'
				},
				blue: {
					DEFAULT: '#2d00f7',
					100: '#090031',
					200: '#120062',
					300: '#1b0093',
					400: '#2400c4',
					500: '#2d00f7',
					600: '#522bff',
					700: '#7d60ff',
					800: '#a895ff',
					900: '#d4caff'
				},
				electric_indigo: {
					DEFAULT: '#6a00f4',
					100: '#150031',
					200: '#2a0062',
					300: '#400093',
					400: '#5500c4',
					500: '#6a00f4',
					600: '#872bff',
					700: '#a560ff',
					800: '#c395ff',
					900: '#e1caff'
				},
				violet: {
					DEFAULT: '#8900f2',
					100: '#1b0030',
					200: '#360060',
					300: '#510090',
					400: '#6d00c0',
					500: '#8900f2',
					600: '#a127ff',
					700: '#b95dff',
					800: '#d093ff',
					900: '#e8c9ff'
				},
				veronica: {
					DEFAULT: '#a100f2',
					100: '#200030',
					200: '#400060',
					300: '#600090',
					400: '#8000c0',
					500: '#a100f2',
					600: '#b727ff',
					700: '#c95dff',
					800: '#db93ff',
					900: '#edc9ff'
				},
				veronica_2: {
					DEFAULT: '#b100e8',
					100: '#23002e',
					200: '#46005c',
					300: '#6a008a',
					400: '#8d00b8',
					500: '#b100e8',
					600: '#cb1fff',
					700: '#d857ff',
					800: '#e58fff',
					900: '#f2c7ff'
				},
				electric_purple: {
					DEFAULT: '#bc00dd',
					100: '#25002c',
					200: '#4b0058',
					300: '#700084',
					400: '#9500af',
					500: '#bc00dd',
					600: '#dc16ff',
					700: '#e551ff',
					800: '#ee8bff',
					900: '#f6c5ff'
				},
				steel_pink: {
					DEFAULT: '#d100d1',
					100: '#2a002a',
					200: '#540054',
					300: '#7d007d',
					400: '#a700a7',
					500: '#d100d1',
					600: '#ff0eff',
					700: '#ff4aff',
					800: '#ff87ff',
					900: '#ffc3ff'
				},
				steel_pink_2: {
					DEFAULT: '#db00b6',
					100: '#2c0025',
					200: '#580049',
					300: '#84006e',
					400: '#af0092',
					500: '#db00b6',
					600: '#ff16d8',
					700: '#ff51e2',
					800: '#ff8bec',
					900: '#ffc5f5'
				},
				hollywood_cerise: {
					DEFAULT: '#e500a4',
					100: '#2e0021',
					200: '#5c0042',
					300: '#8a0063',
					400: '#b80084',
					500: '#e500a4',
					600: '#ff1fbf',
					700: '#ff57cf',
					800: '#ff8fdf',
					900: '#ffc7ef'
				},
				magenta: {
					DEFAULT: '#f20089',
					100: '#30001b',
					200: '#600036',
					300: '#900051',
					400: '#c0006d',
					500: '#f20089',
					600: '#ff27a1',
					700: '#ff5db9',
					800: '#ff93d0',
					900: '#ffc9e8'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
