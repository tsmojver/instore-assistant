import styles from './ChatMessage.module.css'
import PropTypes from 'prop-types'

const ChatMessage = ({ isLeftAligned, children }) => {
	return (
		<div className={`${styles.chatBubbleContainer} ${isLeftAligned ? styles.leftAligned : ''}`}>
			<div className={styles.chatBubble}>{children}</div>
		</div>
	)
}
ChatMessage.propTypes = {
	isLeftAligned: PropTypes.bool,
	children: PropTypes.node.isRequired,
}

export default ChatMessage