import { XIcon } from '@heroicons/react/outline';
import Checkbox from './Checkbox';

type Props = {
	radio?: boolean;
	active?: boolean;
	base?: boolean;
	onClick: () => void;
	label: string;
	sublabel?: string;
	className?: string;
	onX?: () => void;
};

const ModalListItem = ({
	radio,
	active,
	onClick,
	base,
	label,
	sublabel,
	className,
	onX,
}: Props) => {
	return (
		<div className="flex items-center px-8 pt-5">
			<button
				className={`fx w-full ${base ? 'bg-skin-base' : 'bg-white'} ${className}`}
				onClick={onClick}
			>
				{radio && <Checkbox theme='highlight' disabled radio value={active} />}
				<div className={`text-left flex-1 ${radio ? 'ml-4' : ''}`}>
					<p className="text-sm text-black font-bold">{label}</p>
					{sublabel && (
						<p className="text-sm font-normal text-black">{sublabel}</p>
					)}
				</div>
			</button>
			{onX && (
				<button
					className="xy w-8 h-8 mr-2 overflow-hidden rounded-full"
					onClick={onX}
				>
					<XIcon className="w-5 text-black" />
				</button>
			)}
		</div>
	);
};

export default ModalListItem;
