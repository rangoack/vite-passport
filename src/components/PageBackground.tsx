import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
	padding?: string;
};

const PageBackground = ({children, className = 'green2blue', padding = 'px-5 py-6'}: Props) => {
	return (
		<div className={`h-full ${className}`}>
			<section className={`h-full ${padding}`}>
				{children}
			</section>
		</div>
	);
};

export default PageBackground;