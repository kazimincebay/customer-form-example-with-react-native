import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Dialog from "react-native-dialog";

type Customer = {
  id: number;
  customerFullName: string;
  customerBalance: number;
};

const UsersScreen = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://192.168.1.36:8000/api/customers");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Hata:", errorData);
        Alert.alert("Veri çekilemedi!");
        setLoading(false);
        return;
      }

      const data: Customer[] = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Hatası:", error);
      Alert.alert("Sunucuya ulaşılamadı!");
      setLoading(false);
    }
  };

  const openEditModal = async (id: number) => {
    setVisible(true);
    try {
      const response = await fetch(
        `http://192.168.1.36:8000/api/customers/${id}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Hata:", errorData);
        Alert.alert("Veri çekilemedi!");
        setLoading(false);
        return;
      }

      const data: Customer = await response.json();
      setSelectedCustomer(data);
    } catch (error) {
      console.error("Fetch Hatası:", error);
      Alert.alert("Sunucuya ulaşılamadı!");
      setLoading(false);
    }
  };

  const editCustomer = async (
    id: number,
    customerFullName: string,
    customerBalance: string
  ) => {

  try {
    const response = await fetch(
      `http://192.168.1.36:8000/api/customers/${id}`,
      {
        method: "PUT", // Güncelleme işlemi
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          customerFullName:customerFullName,
          customerBalance: customerBalance, // string → number
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Güncelleme başarısız!");
    }

    const updatedCustomer = await response.json();

    // Eğer local state’de listeyi de güncellemek istersen:
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === updatedCustomer.id ? updatedCustomer : c
      )
    );

    setVisible(false); // Dialog’u kapat
    setSelectedCustomer(null); // seçili müşteriyi sıfırla
  } catch (error) {
    console.error(error);
  }
};

  const deleteCustomer = (id: number) => {
    Alert.alert("Sil", "Bu müşteriyi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `http://192.168.1.36:8000/api/customers/${id}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) throw new Error("Silme işlemi başarısız");
            Alert.alert("Başarılı", "Müşteri silindi!");
            setCustomers((prev) =>
              prev.filter((customer) => customer.id !== id)
            );
          } catch (error) {
            console.error("Silme Hatası:", error);
            Alert.alert("Hata", "Müşteri silinemedi!");
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Müşteri Listesi</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.id}</Text>
            <Text style={styles.cell}>{item.customerFullName}</Text>
            <Text style={styles.cell}>{item.customerBalance}</Text>
            {/* Güncelle Butonu */}
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => openEditModal(item.id)}
            >
              <Text style={styles.buttonText}>Güncelle</Text>
            </TouchableOpacity>

            {/* Sil Butonu */}
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => deleteCustomer(item.id)}
            >
              <Text style={styles.buttonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, styles.headerText]}>Id</Text>
            <Text style={[styles.cell, styles.headerText]}>Ad</Text>
            <Text style={[styles.cell, styles.headerText]}>Bakiye</Text>
            <Text style={[styles.cell, styles.headerText]}>Güncelle</Text>
            <Text style={[styles.cell, styles.headerText]}>Sil</Text>
          </View>
        )}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Müşteri Güncelle</Dialog.Title>
          <Dialog.Input
            label="Ad Soyad"
            value={selectedCustomer?.customerFullName ?? ""}
            onChangeText={(text) =>
              setSelectedCustomer((prev) =>
                prev ? { ...prev, customerFullName: text } : prev
              )
            }
          />

          <Dialog.Input
            label="Bakiye"
            value={selectedCustomer?.customerBalance?.toString() ?? ""}
            keyboardType="numeric"
            onChangeText={(text) =>
              setSelectedCustomer((prev) =>
                prev ? { ...prev, customerBalance: Number(text) } : prev
              )
            }
          />
          <Dialog.Button label="İptal" onPress={() => setVisible(false)} />
          <Dialog.Button
            label="Kaydet"
            onPress={() => {
              if (selectedCustomer) {
                editCustomer(
                  selectedCustomer.id,
                  selectedCustomer.customerFullName,
                  selectedCustomer.customerBalance.toString()
                );
              }
            }}
          />
        </Dialog.Container>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 2,
    paddingHorizontal: 7,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#ddd",
  },
  headerText: {
    fontWeight: "bold",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UsersScreen;
