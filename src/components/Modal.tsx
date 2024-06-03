import { PlusIcon } from '@heroicons/react/solid';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useKeyPress } from '../utils/hooks';
import Spinner from './Spinner';
import PageBackground from './PageBackground';

type Props = {
	fullscreen?: boolean;
	spinner?: boolean;
	bottom?: boolean;
	noHeader?: boolean;
	heading?: string;
	subheading?: string;
	onClose: () => void;
	children: ReactNode;
	className?: string;
	buttonText?: string;
	buttonTextColor?: string;
	plusIcon?: boolean;
	noBackArrow?: boolean;
	onButtonClick?: () => void;
};

const modalParent = document.getElementById('modal')!;

const Modal = ({
	fullscreen,
	noHeader,
	heading,
	subheading,
	onClose,
	children,
	className,
	plusIcon,
	buttonText,
	buttonTextColor = 'text-black',
	onButtonClick,
	spinner,
	bottom,
	noBackArrow,
}: Props) => {
	const modalRef = useRef<HTMLDivElement | null>(null);
	const mouseDraggingModal = useRef(false);

	useKeyPress('Escape', () => {
		const index = Array.prototype.indexOf.call(modalParent!.children, modalRef.current);
		if (modalParent!.children.length - 1 === index) {
			onClose();
		}
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			if (!modalParent.children.length) {
				document.body.style.overflow = 'visible';
			}
		};
	}, []);

	return ReactDOM.createPortal(
		<div
			ref={modalRef}
			className="z-10 h-full w-full fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm overflow-scroll"
			onClick={() => {
				!mouseDraggingModal.current && onClose();
				mouseDraggingModal.current = false;
			}}
		>
			{spinner ? (
				<div className="w-full h-full xy">
					<Spinner />
				</div>
			) : fullscreen ? (
				<PageBackground padding='py-6'>
					<div
						onClick={(e) => e.stopPropagation()}
						className="flex flex-col w-full h-full"
					>
						<div className="xy h-9 px-5">
							{!noBackArrow && (
								<button className="w-6 xy" onClick={onClose}>
									<ChevronLeftIcon className="size-4" />
								</button>
							)}
							{heading && <p className="grow pr-9 text-lg text-center font-bold">{heading}</p>}
						</div>
						{subheading && (
							<p className="text-center h-5 text-xs text-white">{subheading}</p>
						)}
						<div className={`flex-1 ${className}`}>{children}</div>
					</div>
				</PageBackground>
			) : bottom ? (
				<div onClick={(e) => e.stopPropagation()} className="h-full flex flex-col">
					<div className="flex-1" onClick={onClose} />
					<div className={`bg-skin-middleground ${className}`}>{children}</div>
				</div>
			) : (
				<div className="min-h-full flex flex-col">
					<div className="flex-1 min-h-[3rem]" />
					<div className="flex justify-center overflow-visible">
						<div
							className={`bg-white w-full max-w-full mx-5 rounded-3xl shadow-t-2`}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={() => (mouseDraggingModal.current = true)}
							onMouseUp={() => (mouseDraggingModal.current = false)}
						>
							{!noHeader && (
								<div className="xy h-12 border-b border-skin-highlight">
									<p className="text-lg text-center leading-4 text-black font-bold">{heading}</p>
									{subheading && (
										<p className="mt-1 text-center leading-3 text-xs text-black">
											{subheading}
										</p>
									)}
								</div>
							)}
							<div className={className}>{children}</div>
							{buttonText && (
								<button
									className={`h-12 px-2 w-full ${buttonTextColor} text-lg font-bold border-t border-skin-highlight ${
										plusIcon ? 'fx' : 'xy'
									}`}
									onClick={onButtonClick}
								>
									{plusIcon && <PlusIcon className="w-6 ml-1 mr-2" />}
									{buttonText}
								</button>
							)}
						</div>
					</div>
					<div className="flex-1 min-h-[2rem]"></div>
				</div>
			)}
		</div>,
		modalParent!
	);
};

export default Modal;
