import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { State } from '../utils/types';
import A from '../components/A';
import Checkbox from '../components/Checkbox';
import { encrypt } from '../utils/encryption';
import { wallet } from '@vite/vitejs';
import { setValue } from '../utils/storage';
import { useState } from 'react';
import Button from '../components/Button';
import { AddressObj } from '@vite/vitejs/distSrc/utils/type';

const Create2 = ({ i18n, sendBgScriptPortMessage, setState, secrets }: State) => {
	const navigate = useNavigate();
	const { state } = useLocation() as {
		state: { routeAfterUnlock?: string };
	};
	const [agreesToTerms, agreesToTermsSet] = useState(false);
	const mnemonicRef = useTextInputRef();
	const passwordRef = useTextInputRef();
	const confirmPasswordRef = useTextInputRef();

	return !secrets ? null : (
		<PageContainer heading={i18n.createWallet}>
			<section>
				<TextInput
					optional
					autoFocus
					textarea
					_ref={mnemonicRef}
					label={i18n.confirmMnemonicPhrase}
					getIssue={(v) => {
						if (v !== secrets.mnemonics) {
							return i18n.incorrectMnemonicPhrase;
						}
					}}
				/>
				<TextInput
					password
					showPasswordRequirements
					containerClassName="mt-4"
					_ref={passwordRef}
					label={i18n.password}
				/>
				<TextInput
					password
					containerClassName="mt-4"
					_ref={confirmPasswordRef}
					label={i18n.confirmPassword}
				/>
				<div className="mt-4 fx">
					<Checkbox value={agreesToTerms} onUserInput={(v) => agreesToTermsSet(v)} />
					<p className="text-white text-xs font-normal">
						{i18n.iHaveReadAndAgreeToThe}{' '}
						<A href="https://vite.org/terms.html" className="text-white font-normal">
							{i18n.termsOfUse}
						</A>
					</p>
				</div>
			</section>
			<section>
				<Button
					theme="white"
					disabled={!agreesToTerms}
					label={i18n.next}
					onClick={async () => {
						let valid = validateInputs([mnemonicRef, passwordRef, confirmPasswordRef]);
						if (passwordRef.value !== confirmPasswordRef.value) {
							confirmPasswordRef.error = i18n.passwordsDoNotMatch;
							valid = false;
						}
						if (valid) {
							sendBgScriptPortMessage({ secrets, type: 'updateSecrets' });
							const encryptedSecrets = await encrypt(JSON.stringify(secrets), passwordRef.value);
							const account: AddressObj = wallet.deriveAddress({
								...secrets,
								index: 0,
							});
							const derivedAddresses = [account.address];
							const contacts = { [account.address]: 'Account 0' };
							setValue({ encryptedSecrets, derivedAddresses, contacts });
							setState({
								secrets,
								encryptedSecrets,
								derivedAddresses,
								contacts,
								activeAccount: account,
							});
							navigate(state.routeAfterUnlock || '/home');
						}
					}}
				/>
			</section>
		</PageContainer>
	);
};

export default connect(Create2);
