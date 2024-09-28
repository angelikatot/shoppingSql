import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SQLiteContext } from './SQLiteProvider';

const ShoppingList = () => {
    const [product, setProduct] = useState('');
    const [amount, setAmount] = useState('');
    const [items, setItems] = useState([]);
    const { insertItem, getItems, deleteItem } = useContext(SQLiteContext);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const loadedItems = await getItems();
            setItems(loadedItems);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const addItem = async () => {
        if (product && amount) {
            try {
                await insertItem(product, amount);
                setProduct('');
                setAmount('');
                loadItems();
            } catch (error) {
                console.error('Error adding item:', error);
            }
        }
    };

    const removeItem = async (id) => {
        try {
            await deleteItem(id);
            loadItems();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text>{item.product} - {item.amount}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.boughtText}>Bought</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Product"
                value={product}
                onChangeText={setProduct}
            />
            <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
            />
            <Button title="Add Item" onPress={addItem} />
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        width: '100%',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    boughtText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default ShoppingList;