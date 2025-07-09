// Define types for table records and tables
type Table = Record<string, any>[];

/**
 * Performs an INNER JOIN operation on two tables
 * @param leftTable First table
 * @param rightTable Second table
 * @param leftKey Join key for left table
 * @param rightKey Join key for right table
 * @returns Joined table
 */
function innerJoin(
    leftTable: Table,
    rightTable: Table,
    leftKey: string,
    rightKey: string
): Table {
    return leftTable.reduce((joined: Table, leftRecord) => {
        const matches = rightTable.filter(rightRecord => 
            leftRecord[leftKey] === rightRecord[rightKey]
        );
        
        matches.forEach(rightRecord => {
            joined.push({
                ...leftRecord,
                ...rightRecord
            });
        });
        
        return joined;
    }, []);
}

/**
 * Performs a LEFT JOIN operation on two tables
 * @param leftTable First table
 * @param rightTable Second table
 * @param leftKey Join key for left table
 * @param rightKey Join key for right table
 * @returns Joined table
 */
function leftJoin(
    leftTable: Table,
    rightTable: Table,
    leftKey: string,
    rightKey: string
): Table {
    return leftTable.reduce((joined: Table, leftRecord) => {
        const matches = rightTable.filter(rightRecord =>
            leftRecord[leftKey] === rightRecord[rightKey]
        );
        
        if (matches.length === 0) {
            joined.push(leftRecord);
        } else {
            matches.forEach(rightRecord => {
                joined.push({
                    ...leftRecord,
                    ...rightRecord
                });
            });
        }
        
        return joined;
    }, []);
}

// Test the implementation
const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' }
];

const orders = [
    { orderId: 1, userId: 1, product: 'Book' },
    { orderId: 2, userId: 1, product: 'Pen' },
    { orderId: 3, userId: 2, product: 'Notebook' }
];

console.log('INNER JOIN Result:');
console.log(innerJoin(users, orders, 'id', 'userId'));

console.log('\nLEFT JOIN Result:');
console.log(leftJoin(users, orders, 'id', 'userId'));