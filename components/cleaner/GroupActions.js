import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import COLORS from "../../constants/colors";

const GroupActions = ({ status, onAccept, onDecline, onDetails }) => {
  const isSelected = status === "selected";

  return (
    <View style={styles.actionsRow}>
      {/* Left Side - Details Button */}
      <TouchableOpacity style={[styles.button, styles.detailButton]} onPress={onDetails}>
        <Text style={styles.detailText}>Details </Text>
      </TouchableOpacity>

      {/* Right Side - Accept/Decline or Claimed */}
      {isSelected ? (
        <View style={styles.rightWrapper}>
          <View style={styles.claimedBadgeContainer}>
            <Icon name="check-decagram" size={16} color="#28a745" style={{ marginRight: 4 }} />
            <Text style={styles.claimedBadge}>Claimed</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.declineButton, styles.disabledButton]}
            disabled={true}
          >
            <Icon name="lock-outline" size={16} color="#999" style={{ marginRight: 4 }} />
            <Text style={styles.disabledText}>Decline</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.rightWrapper}>
          <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={onDecline}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between", // left vs right
    marginTop: 12,
    alignItems: "center",
  },
  rightWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto", // pushes to right
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  acceptButton: {
    backgroundColor: "#28a745",
  },
  declineButton: {
    backgroundColor: "#d9534f",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    opacity: 0.5,
  },
  disabledText: {
    color: "#999",
    fontWeight: "600",
  },
  claimedBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#e6f4ea",
    marginRight: 4, // space before decline button
    marginLeft:7
  },
  claimedBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#28a745",
  },
  detailButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  detailText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default GroupActions;