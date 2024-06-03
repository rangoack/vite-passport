type Props = {
	onClick: () => void;
	label: string;
	className?: string;
	disabled?: boolean;
	theme: 'white' | 'highlight' | 'lowlight' | 'foreground';
};

const Button = ({ onClick, label, disabled, theme = 'highlight', className = '' }: Props) => {
	return (
		<button
			disabled={disabled}
			className={`h-12 w-full xy rounded-xl text-lg font-bold
			${disabled && 'disabled:opacity-50 disabled:cursor-not-allowed'}
			${({
					white: 'bg-white text-black',
					highlight: 'bg-skin-highlight text-white',
					lowlight: 'bg-skin-lowlight text-black',
					foreground: 'bg-skin-foreground text-skin-lowlight',
				}[theme])}
			${className}`}
			onClick={onClick}
		>
			{label}
		</button>
	);
};

export default Button;
