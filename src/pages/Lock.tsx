import { wallet } from '@vite/vitejs';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TextInput, { TextInputRefObject } from '../containers/TextInput';
import ResetWalletModal from '../containers/ResetWalletModal';
import { decrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

const Lock = ({ i18n, activeAccountIndex, setState, postPortMessage, encryptedSecrets }: State) => {
	const passwordRef = useRef<TextInputRefObject>();
	const [resettingWallet, resettingWalletSet] = useState(false);
	const [password, passwordSet] = useState('');
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const attemptUnlock = useCallback(async () => {
		const valid = validateInputs([passwordRef]);
		if (valid) {
			try {
				const secrets = JSON.parse(await decrypt(encryptedSecrets, password));
				setState({
					secrets,
					activeAccount: wallet.deriveAddress({
						...secrets,
						index: activeAccountIndex,
					}),
				});
				postPortMessage({ secrets, type: 'updateSecrets' });
				const routeAfterUnlock = searchParams.get('routeAfterUnlock');
				navigate(routeAfterUnlock || '/home', { replace: true });
			} catch {
				passwordRef.current?.issueSet(i18n.incorrectPassword);
			}
		}
	}, [
		password,
		activeAccountIndex,
		searchParams,
		encryptedSecrets,
		i18n.incorrectPassword,
		navigate,
		postPortMessage,
		setState,
	]);

	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				{/* <ViteLogo size={170} className="drop-shadow-lg text-[var(--bg-base-color)]" /> */}
				<p className="text-3xl drop-shadow-lg font-black text-skin-muted">Vite Passport</p>
			</div>
			<TextInput
				password
				autoFocus
				_ref={passwordRef}
				label={i18n.password}
				value={password}
				onUserInput={(v) => passwordSet(v)}
				onKeyDown={(key) => {
					if (key === 'Enter') {
						attemptUnlock();
					}
				}}
			/>
			<button className="mt-2 round-solid-button" onClick={attemptUnlock}>
				{i18n.unlock}
			</button>
			<button
				className="mt-1 text-skin-highlight self-center"
				onClick={() => resettingWalletSet(true)}
			>
				{i18n.resetWallet}
			</button>
			<ResetWalletModal visible={resettingWallet} onClose={() => resettingWalletSet(false)} />
		</div>
	);
};

export default connect(Lock);
