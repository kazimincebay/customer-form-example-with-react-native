import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../App";
type Props = BottomTabScreenProps<RootTabParamList, "AddCustomer">;
const FormScreen = ({ navigation }: Props) => {
  
  const [form, setForm] = useState({
    customerFullName: "",
    customerBalance: "",
  });

  const handleSubmit = async () => {
    if (!form.customerFullName || !form.customerBalance) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (isNaN(Number(form.customerBalance))) {
      Alert.alert("Hata", "Balance sayısal bir değer olmalıdır.");
      return;
    }

    // Burada backend'e gönderebilirsin
    const response = await fetch("http://192.168.1.36:8000/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      // HTTP hatası varsa
      const errorData = await response.json();
      console.error("Hata:", errorData);
      alert("Bir hata oluştu!");
      return;
    }

    const data = await response.json();
    alert("Müşteri başarıyla kaydedildi!");
    navigation.navigate("Customers");

    // Formu temizle
    setForm({ customerFullName: "", customerBalance: "" });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Müşteri Ekle</Text>

      <TextInput
        style={styles.input}
        placeholder="Müşteri Adı"
        value={form.customerFullName}
        onChangeText={(text) => setForm({ ...form, customerFullName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Bakiye"
        value={String(form.customerBalance)}
        onChangeText={(text) => setForm({ ...form, customerBalance: text })}
        keyboardType="numeric"
      />

      <Button title="Gönder" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
});

export default FormScreen;
