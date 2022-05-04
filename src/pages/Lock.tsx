import { useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ViteLogo from '../assets/ViteLogo';
import A from '../components/A';
import TextInput, { TextInputRefObject } from '../components/TextInput';
import { decrypt } from '../utils/encryption';
import { connect } from '../utils/global-context';
import { validateInputs } from '../utils/misc';
import { getValue } from '../utils/storage';
import { State } from '../utils/types';
// import { accountBlock } from '@vite/vitejs'
// console.log('accountBlock:', accountBlock)

type Props = State;

const Lock = ({ i18n, setState, postPortMessage, encryptedSecrets }: Props) => {
	const passwordRef = useRef<TextInputRefObject>();
	const [password, passwordSet] = useState('');
	const navigate = useNavigate();
	// const location = useLocation();
	const attemptUnlock = useCallback(async () => {
		const valid = validateInputs([passwordRef]);
		if (valid) {
			try {
				const secrets = JSON.parse(await decrypt(encryptedSecrets, password));
				setState({ secrets });
				postPortMessage({ secrets, type: 'updateSecrets' });
				navigate('/home', { replace: true });
			} catch {
				passwordRef.current?.issueSet(i18n.incorrectPassport);
			}
		}
	}, [password]);
	// console.log('location:', location);

	return (
		<div className="p-4 h-full flex flex-col">
			<div className="flex-1 xy flex-col">
				{/* <ViteLogo size={170} className="drop-shadow-lg text-[var(--bg-base-color)]" /> */}
				<p className="text-3xl drop-shadow-lg font-black text-skin-muted">Vite Passport</p>
			</div>
			<form
				className="w-full"
				onSubmit={(e) => {
					e.preventDefault();
					attemptUnlock();
				}}
			>
				<TextInput
					password
					autoFocus
					_ref={passwordRef}
					label={i18n.password}
					value={password}
					onUserInput={(v) => passwordSet(v)}
				/>
			</form>
			<button className="mt-2 round-solid-button" onClick={attemptUnlock}>
				{i18n.unlock}
			</button>
		</div>
	);
};

export default connect(Lock);