import { ReactNode } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';

type Props = {
	heading?: string;
	children: ReactNode;
	className?: string;
};

const PageContainer = ({ heading, children, className='grid-rows-[1fr_auto]' }: Props) => {
	const navigate = useNavigate();
	return (
		<PageBackground>
			<div className="h-full flex flex-col overflow-visible">
				<div className="xy w-full h-12">
					<button className="flex-none w-6 xy" onClick={() => navigate(-1)}>
						<ChevronLeftIcon className="size-4" />
					</button>
					<p className="grow text-center text-lg font-bold">{heading}</p>
				</div>
				<div className={`h-full overflow-visible grid ${className}`}>{children}</div>
			</div>
		</PageBackground>
	);
};

export default PageContainer;
