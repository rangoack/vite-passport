import { CheckCircleIcon, CheckIcon } from '@heroicons/react/solid';
import { useMemo } from 'react';

type Props = {
	disabled?: boolean;
	onUserInput?: (value: boolean) => void;
	value?: boolean;
	radio?: boolean;
	className?: string;
	theme?: 'white' | 'highlight';
};

const Checkbox = ({ disabled, radio, onUserInput = () => {}, value, className, theme = 'white' }: Props) => {
	const Tag = useMemo(() => (radio && disabled ? 'div' : 'button'), [radio, disabled]);

	return radio ? (
		<Tag disabled={disabled} className="p-2 -m-2 xy relative" onClick={() => onUserInput(!value)}>
			{value ? (
				<>
					{/* This hack gives CheckCircleIcon a white checkmark */}
					<div className="bg-white h-4 w-4 absolute rounded-full z-0" />
					{/* The scale is to offset the the padding of the icon... */}
					<CheckCircleIcon className="w-5 text-skin-highlight z-10 scale-[1.2]" />
				</>
			) : (
				<div className={`w-5 h-5 border-2 rounded-full ${theme === 'white' ? 'border-white' : 'border-skin-highlight'}`} />
			)}
		</Tag>
	) : (
		<button
			disabled={disabled}
			className={`h-8 w-8 p-1.5 -m-1.5 -mr-0.5 ${className}`}
			onClick={() => onUserInput(!value)}
		>
			<div className='h-4 w-4 xy border rounded-sm shadow border-white'>
				{value && <CheckIcon className="h-4 w-4 text-white" />}
			</div>
		</button>
	);
};

export default Checkbox;
