import PageBackground from '../components/PageBackground';
import TabContainer from '../components/TabContainer';
import TransactionList from '../containers/TransactionList';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

const MyTransactions = ({ i18n }: State) => {
	return (
		<PageBackground padding='pt-6'>
			<TabContainer heading={i18n.myTransactions}>
				<TransactionList />
			</TabContainer>
		</PageBackground>
	);
};

export default connect(MyTransactions);
