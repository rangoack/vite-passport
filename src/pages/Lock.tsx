import { wallet } from '@vite/vitejs';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ViteLogo from '../assets/ViteLogo';
import Button from '../components/Button';
import ResetWalletModal from '../containers/ResetWalletModal';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { decrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';
import PageBackground from '../components/PageBackground';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

const Lock = ({
	i18n,
	setState,
	sendBgScriptPortMessage,
	encryptedSecrets,
	activeAccountIndex,
}: State) => {
	const passwordRef = useTextInputRef();
	const [resettingWallet, resettingWalletSet] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const attemptUnlock = useCallback(async () => {
		const valid = validateInputs([passwordRef]);
		if (valid) {
			try {
				const secrets = JSON.parse(await decrypt(encryptedSecrets!, passwordRef.value));
				setState({
					secrets,
					activeAccount: wallet.deriveAddress({
						...secrets,
						index: activeAccountIndex,
					}),
				});
				sendBgScriptPortMessage({ secrets, type: 'updateSecrets' });
				navigate(searchParams.get('routeAfterUnlock') || '/home', { replace: true });
			} catch {
				passwordRef.error = i18n.incorrectPassword;
			}
		}
	}, [
		activeAccountIndex,
		passwordRef,
		searchParams,
		encryptedSecrets,
		i18n.incorrectPassword,
		navigate,
		sendBgScriptPortMessage,
		setState,
	]);

	return (
		<PageBackground className='blue2green'>
			<div className="h-full flex flex-col">
				<div className="flex-1 xy flex-col">
					<ViteLogo size={200} className="text-skin-primary" />
				</div>
				<TextInput
					password
					autoFocus
					_ref={passwordRef}
					label={i18n.password}
					onKeyDown={(key) => {
						if (key === 'Enter') {
							attemptUnlock();
						}
					}}
				/>
				<Button theme="white" className="mt-4" label={i18n.unlock} onClick={attemptUnlock} />
				<button
					className="mt-5 text-white text-lg font-bold self-center"
					onClick={() => resettingWalletSet(true)}
				>
					{i18n.resetWallet}
				</button>
				{resettingWallet && <ResetWalletModal onClose={() => resettingWalletSet(false)} />}
			</div>
		</PageBackground>
	);
};

export default connect(Lock);
