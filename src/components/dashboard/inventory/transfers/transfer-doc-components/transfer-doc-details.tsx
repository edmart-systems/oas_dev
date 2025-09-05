import { StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { Fragment } from "react";

interface TransferDocDetailsProps {
  transfer: {
    transfer_id: number;
    created_at: string;
    status: string;
    note?: string | null;
    from_location: { location_id: number; location_name: string };
    to_location: { location_id: number; location_name: string };
    assigned_user: { userId: number; firstName: string; lastName: string } | null;
    creator?: { co_user_id: string; firstName: string; lastName: string } | null;
  };
}

const TransferDocDetails: React.FC<TransferDocDetailsProps> = ({ transfer }) => {
  return (
    <Fragment>
      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <View style={styles.row}>
            <Text style={styles.label}>Transfer ID:</Text>
            <Text style={styles.value}>#{transfer.transfer_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date(transfer.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{transfer.status}</Text>
          </View>
        </View>
        <View style={styles.rightColumn}>
          <View style={styles.row}>
            <Text style={styles.label}>From:</Text>
            <Text style={styles.value}>{transfer.from_location.location_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.value}>{transfer.to_location.location_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issued by:</Text>
            <Text style={styles.value}>
              {transfer.creator ? `${transfer.creator.firstName} ${transfer.creator.lastName}` : 'Admin User'}
            </Text>
          </View>
          {transfer.assigned_user && (
            <View style={styles.row}>
              <Text style={styles.label}>Assigned to:</Text>
              <Text style={styles.value}>
                {transfer.assigned_user.firstName} {transfer.assigned_user.lastName}
              </Text>
            </View>
          )}
        </View>
      </View>
      {transfer.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Note:</Text>
          <Text style={styles.noteValue}>{transfer.note}</Text>
        </View>
      )}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    marginTop: "10px",
    gap: "20px",
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: "3px",
  },
  label: {
    width: "80px",
    fontSize: "10px",
    fontWeight: 700,
  },
  value: {
    flex: 1,
    fontSize: "10px",
  },
  noteContainer: {
    width: "100%",
    marginTop: "10px",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    borderRadius: "3px",
  },
  noteLabel: {
    fontSize: "10px",
    fontWeight: 700,
    marginBottom: "3px",
  },
  noteValue: {
    fontSize: "10px",
  },
});

export default TransferDocDetails;