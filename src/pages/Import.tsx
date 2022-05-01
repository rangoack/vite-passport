import { XIcon } from '@heroicons/react/outline';
import { validateMnemonics } from '@vite/vitejs/distSrc/wallet/hdKey';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { encrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { setValue } from '../utils/storage';
import { State } from '../utils/types';

type Props = State;

const Import = ({ i18n, setState }: Props) => {
	const navigate = useNavigate();
	const [mnemonics, mnemonicsSet] = useState('');
	const [bip39Passphrase, bip39PassphraseSet] = useState('');
	const [password, passwordSet] = useState('');
	const mnemonicRef = useRef<TextInputRefObject>();
	const bip39PassphraseRef = useRef<TextInputRefObject>();
	const passwordRef = useRef<TextInputRefObject>();

	return (
		<PageContainer heading="Import Wallet" className="gap-3">
			<TextInput
				textarea
				_ref={mnemonicRef}
				value={mnemonics}
				onUserInput={(v) => mnemonicsSet(v)}
				label={i18n.mnemonicPhrase}
				inputClassName="h-44"
				getIssue={(v) => {
					if (!validateMnemonics(v)) {
						return 'Invalid mnemonic phrase';
					}
				}}
			/>
			<TextInput
				optional
				_ref={bip39PassphraseRef}
				value={bip39Passphrase}
				onUserInput={(v) => bip39PassphraseSet(v)}
				label={i18n.bip39Passphrase}
			/>
			<TextInput _ref={passwordRef} value={password} onUserInput={(v) => passwordSet(v)} label="Password" />
			<div className="flex-1"></div>
			<button
				className="mt-4 round-solid-button"
				onClick={() => {
					const valid = validateInputs([mnemonicRef, bip39PassphraseRef, passwordRef]);
					if (valid) {
						const secrets = {
							bip39Passphrase,
							mnemonics: mnemonics.trim(),
						};
						setState({ secrets });
						setValue({
							secrets: encrypt(JSON.stringify(secrets), password),
						});
						navigate('/home');
					} else {
						// setState({ toast: ['Fix the input errors', 'error'] });
					}
				}}
			>
				{i18n.next}
			</button>
		</PageContainer>
	);
};

export default connect(Import);
