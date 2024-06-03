import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ViteLogo from '../assets/ViteLogo';
import A from '../components/A';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import PageBackground from "../components/PageBackground";

const Start = ({ i18n }: State) => {
	const [searchParams] = useSearchParams();
	const routeAfterUnlock = useMemo(() => searchParams.get('routeAfterUnlock'), [searchParams]);

	return (
		<PageBackground className='blue2green'>
			<div className="h-full grid grid-rows-[1fr_auto]">
				<section className='self-center justify-self-center'>
					<ViteLogo size={200} className="text-skin-primary" />
				</section>
				<section>
					<A
						to="/create"
						state={{ routeAfterUnlock }}
						className="xy h-12 w-full rounded-xl bg-white text-black text-lg font-bold"
					>
						{i18n.createANewWallet}
					</A>
					<A
						to="/import"
						state={{ routeAfterUnlock }}
						className="xy h-12 w-full bg-skin-highlight rounded-xl mt-3 text-white text-lg font-bold"
					>
						{i18n.importAnExistingWallet}
					</A>
				</section>
			</div>
		</PageBackground>
	);
};

export default connect(Start);
