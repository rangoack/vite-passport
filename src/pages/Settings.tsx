/* eslint-disable */

import React, { useCallback, useRef, useState } from 'react';
import Modal from '../components/Modal';
import ModalListItem from '../components/ModalListItem';
import Secrets from '../containers/Secrets';
import TabContainer from '../components/TabContainer';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import { currencyConversions, i18nDict, languages } from '../utils/constants';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import ResetWalletModal from '../containers/ResetWalletModal';
import { validateInputs } from '../utils/misc';
import { decrypt, encrypt } from '../utils/encryption';
import { setValue } from '../utils/storage';
import { ChevronRightIcon } from '@heroicons/react/outline';
import PageBackground from '../components/PageBackground';

const ListItem = ({
	label,
	value,
	onClick,
	noLine,
}: {
	label: string;
	value?: string;
	onClick: () => void;
	noLine?: boolean;
}) => (
	<>
		{!noLine && <div className="h-px bg-white"></div>}
		<button onClick={onClick} className="fx w-full justify-between pt-8 pb-4">
			<p className="text-sm text-white font-normal">{label}</p>
			{value ? (
				<p className="text-sm text-white font-normal">{value}</p>
			) : (
				<ChevronRightIcon className="w-5 text-white" />
			)}
		</button>
	</>
);

const Settings = ({
	sendBgScriptPortMessage,
	setState,
	currencyConversion,
	encryptedSecrets,
	secrets,
	i18n,
	language,
	toastSuccess,
}: State) => {
	const navigate = useNavigate();
	const passwordRef = useTextInputRef();
	const newPasswordRef = useTextInputRef();
	const confirmNewPasswordRef = useTextInputRef();
	const [activeModal, activeModalSet] = useState<
		'currency' | 'language' | 'contacts' | 'password' | 'secrets' | 'reset' | ''
	>();
	const [showSecrets, showSecretsSet] = useState(false);

	const verifyPassword = useCallback(async () => {
		try {
			await decrypt(encryptedSecrets, passwordRef.value);
			return true;
		} catch {
			passwordRef.error = i18n.incorrectPassword;
			return false;
		}
	}, [encryptedSecrets, i18n.incorrectPassword]);

	const attemptToShowSecrets = useCallback(async () => {
		const valid = passwordRef.isValid && (await verifyPassword());
		if (valid) {
			showSecretsSet(true);
		}
	}, [verifyPassword]);

	return (
		<PageBackground padding='pt-6'>
			<TabContainer heading={i18n.settings}>
				<div className="flex-1 overflow-scroll px-5">
					<ListItem
						noLine
						onClick={() => activeModalSet('currency')}
						label={i18n.currencyConversion}
						value={currencyConversion || i18n.none}
					/>
					<ListItem
						onClick={() => activeModalSet('language')}
						label={i18n.language}
						value={languages[language]}
					/>
					{/* <ListItem
						onClick={() => activeModalSet('contacts')}
						label={i18n.contacts}
					/> */}
					<ListItem onClick={() => activeModalSet('password')} label={i18n.changePassword} />
					<ListItem onClick={() => activeModalSet('secrets')} label={i18n.showSecrets} />
					<ListItem onClick={() => activeModalSet('reset')} label={i18n.resetWallet} />
					<ListItem
						onClick={() => {
							sendBgScriptPortMessage({ type: 'lock' });
							navigate('/lock', { replace: true });
						}}
						label={i18n.lockWallet}
					/>
				</div>
				{activeModal === 'currency' && (
					<Modal
						heading={i18n.currencyConversion}
						className='pb-5'
						onClose={() => activeModalSet('')}
					>
						{currencyConversions.map((shorthand) => {
							const active = currencyConversion === shorthand;
							return (
								<ModalListItem
									radio
									key={shorthand}
									active={active}
									label={shorthand}
									sublabel={i18n[shorthand]}
									onClick={() => {
										if (!active) {
											toastSuccess(i18n.currencyChanged);
											const data = { currencyConversion: shorthand };
											setValue(data);
											setState(data);
										}
										activeModalSet('');
									}}
								/>
							);
						})}
						<ModalListItem
							radio
							active={!currencyConversion}
							label={i18n.none}
							onClick={() => {
								if (currencyConversion) {
									toastSuccess(i18n.currencyChanged);
									const data = { currencyConversion: null };
									setValue(data);
									setState(data);
								}
								activeModalSet('');
							}}
						/>
					</Modal>
				)}
				{activeModal === 'language' && (
					<Modal
						heading={i18n.language}
						className='pb-5'
						onClose={() => activeModalSet('')}
					>
						{Object.entries(languages).map(([shorthand, label]) => {
							const active = language === shorthand;
							return (
								<ModalListItem
									radio
									key={shorthand}
									active={active}
									label={label}
									onClick={() => {
										if (!active) {
											toastSuccess(i18n.languageChanged);
											const data = { language: shorthand as keyof typeof i18nDict };
											setValue(data);
											setState({ i18n: i18nDict[shorthand], ...data });
										}
										activeModalSet('');
									}}
								/>
							);
						})}
					</Modal>
				)}
				{/* {activeModal === 'contacts' && (
					<Modal heading={i18n.contacts} onClose={() => activeModalSet('')}>
						{[['account', 'vite_5e8d4ac7dc8b75394cacd21c5667d79fe1824acb46c6b7ab1f']].map(
							([label, address]) => {
								return (
									<ModalListItem
										key={address}
										label={'accountName'}
										sublabel={shortenAddress(address)}
										onClick={() => {
											// TODO
										}}
									/>
								);
							}
						)}
						<ModalListBottomButton
							label={i18n.addContact}
							onClick={() => {
								// TODO: add contact
							}}
						/>
					</Modal>
				)} */}
				{activeModal === 'password' && (
					<Modal
						heading={i18n.changePassword}
						onClose={() => {
							activeModalSet('');
						}}
						buttonText={i18n.confirm}
						onButtonClick={async () => {
							let valid = validateInputs([passwordRef, newPasswordRef, confirmNewPasswordRef]);
							if (passwordRef.value) {
								valid = (await verifyPassword()) && valid;
							}
							if (newPasswordRef.value !== confirmNewPasswordRef.value) {
								confirmNewPasswordRef.error = i18n.newPasswordsDoNotMatch;
								valid = false;
							}
							if (valid) {
								const encryptedSecrets = await encrypt(JSON.stringify(secrets), newPasswordRef.value);
								const data = { encryptedSecrets };
								setState(data);
								setValue(data);
								activeModalSet('');
								toastSuccess(i18n.passwordChanged);
							}
						}}
					>
						<div className="p-4 my-0.5">
							<TextInput
								password
								showPasswordRequirements
								_ref={passwordRef}
								label={i18n.currentPassword}
								theme='black'
							/>
							<TextInput theme='black' containerClassName='mt-3.5' password _ref={newPasswordRef} label={i18n.newPassword} />
							<TextInput theme='black' containerClassName='mt-3.5' password _ref={confirmNewPasswordRef} label={i18n.confirmNewPassword} />
						</div>
					</Modal>
				)}
				{activeModal === 'secrets' && (
					<Modal
						onClose={() => {
							activeModalSet('');
							showSecretsSet(false);
						}}
						heading={i18n.secrets}
						buttonText={!showSecrets ? i18n.next : ''}
						onButtonClick={() => {
							attemptToShowSecrets();
						}}
					>
						{showSecrets ? (
							<Secrets {...secrets!} />
						) : (
							<div className="p-3">
								<TextInput
									theme='black'
									password
									autoFocus
									_ref={passwordRef}
									label={i18n.password}
									onKeyDown={(key) => {
										if (key === 'Enter') {
											attemptToShowSecrets();
										}
									}}
								/>
							</div>
						)}
					</Modal>
				)}
				{activeModal === 'reset' && <ResetWalletModal onClose={() => activeModalSet('')} />}
			</TabContainer>
		</PageBackground>
	);
};

export default connect(Settings);
