import React, { createContext, useEffect, useState } from 'react';
import { Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

export const SQLiteContext = createContext(null);

export const SQLiteProvider = ({ children }) => {
    const [db, setDb] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            console.log('Attempting to open database...');
            const database = SQLite.openDatabase('shoppingdb');
            console.log('Database opened successfully:', database);
            setDb(database);

            database.transaction(tx => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS shopping_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT,
            amount TEXT
          );`,
                    [],
                    () => {
                        console.log('Table created or already exists');
                    },
                    (_, error) => {
                        console.error('Table creation failed:', error);
                        setError(error.message);
                    }
                );
            });
        } catch (e) {
            console.error('Error in SQLiteProvider:', e);
            setError(e.message);
        }
    }, []);

    const executeQuery = (sql, params = []) => new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.transaction(tx => {
            tx.executeSql(sql, params, (_, { rows }) => {
                resolve(rows._array);
            }, (_, error) => {
                reject(error);
            });
        });
    });

    const insertItem = (product, amount) => {
        return executeQuery('INSERT INTO shopping_item (product, amount) VALUES (?, ?)', [product, amount]);
    };

    const getItems = () => {
        return executeQuery('SELECT * FROM shopping_item');
    };

    const deleteItem = (id) => {
        return executeQuery('DELETE FROM shopping_item WHERE id = ?', [id]);
    };

    if (error) {
        return <Text>Error initializing database: {error}</Text>;
    }

    if (!db) {
        return <Text>Loading database...</Text>;
    }

    return (
        <SQLiteContext.Provider value={{ db, executeQuery, insertItem, getItems, deleteItem }}>
            {children}
        </SQLiteContext.Provider>
    );
};