// 1

const person = {
    firstName: "John",
    lastName: "Doe",
    age: 30,
    email: "john.doe@example.com",

    updateInfo(newInfo) {
        for (const prop in newInfo) {
            if (this.hasOwnProperty(prop)) {
                const propertyDescriptor = Object.getOwnPropertyDescriptor(this, prop);
                if (propertyDescriptor && propertyDescriptor.writable) {
                    this[prop] = newInfo[prop];
                }
            }
        }
    }
}

person.updateInfo({ firstName: "Jane", age: 32 })
// console.log(person)

Object.keys(person).map(elem => Object.defineProperty(person, elem, {
    writable: false,
}))

Object.defineProperty(person, "adress", {
    value: {},
    configurable: false,
    enumerable: false,
})
// 2

const product = {
    name: "Laptop",
    price: 1000,
    quantity: 5,
}

Object.defineProperties(product, {
    'price': {
        enumerable: false,
        writable: false
    },
    'quantity': {
        enumerable: false,
        writable: false
    }
});

function getTotalPrice (obj) {
    const price = Object.getOwnPropertyDescriptor(obj, 'price')
    const quantity = Object.getOwnPropertyDescriptor(obj, 'quantity')
    return price.value * quantity.value
}

function deleteNonConfigurable (obj, propName) {
    try {
        if (obj.hasOwnProperty(propName)) {
            const propDescriptor = Object.getOwnPropertyDescriptor(obj, propName)
            if (!propDescriptor.configurable) {
                throw new Error('Cannot delete non-configurable properties')
            }
            delete obj[propName]
        }
    } catch (e) {
        console.log(e.message)
    }
}

// 3

const bankAccount = {
    _balance: 1000,

    get formattedBalance() {
        return `${this._balance}$`
    },

    set balance(value) {
        this._balance = value
    },

    transfer(bankAccount1, bankAccount2, sum) {
        if (bankAccount1._balance < sum) {
            return 'Cannot transfer'
        }
        const transaction = (bankAccount1._balance -= sum) && (bankAccount2._balance += sum)
        if (transaction) return 'Success'
    }
}

// 4

function createImmutableObject (obj) {
    const newObject = {}
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
             newObject[key] = createImmutableObject(obj[key])
        }
        newObject[key] = obj[key];
        Object.defineProperty(newObject, key, {
            writable: false,
            configurable: false
        })
    }
    return newObject
}

// 5

function observeObject (obj, callback) {
    return new Proxy(obj, {
        get(target, prop) {
            const value = Reflect.get(target, prop)
            callback(prop, value)
            return value
        },
        set(target, prop, value) {
            const prevValue = Reflect.get(target, prop)
            const result = Reflect.set(target, prop, value)
            if (prevValue !== value) {
                callback(prop, value)
            }
            return result
        }
    })
}

// 6

function deepCloneObject (obj) {
    const clone = !Array.isArray(obj) ? {} : []

    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            clone[key] = deepCloneObject(obj[key])
        } else {
            clone[key] = obj[key]
        }
    }
    return clone
}

function deepCloneObjectWithoutRecursion (obj) {
    const stack = [{ original: obj, clone: !Array.isArray(obj) ? {} : [] }];
    const clone = stack[0].clone;

    while (stack.length > 0) {
        const { original, clone } = stack.pop();

        for (const key in original) {
            if (typeof original[key] === 'object') {
                const nestedClone = !Array.isArray(original[key]) ? {} : [];
                clone[key] = nestedClone;
                stack.push({ original: original[key], clone: nestedClone });
            } else {
                clone[key] = original[key];
            }
        }
    }

    return clone;
}

const cat = {
    name: 'Gusya',
    age: 4,
    color: {
        tail: 'white',
        body: {
            head: 'peach',
            osnova: 'white'
        }
    },
    girls: ['grayCat', 'brownCat'],
    enemies: 'blackCat'
}

const newCat = deepCloneObject(cat)
const newCoolCat = deepCloneObjectWithoutRecursion(cat)
newCoolCat.color.body.head = 'black'
console.log(cat)
console.log(newCat)
console.log(newCoolCat)
// 7

function validateObject (obj, schema) {
    for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
            const validationFn = schema[key];

            if (!validationFn(obj[key])) {
                return false;
            }
        }
    }
    return true;
}

const schema = {
    name: (value) => typeof value === 'string' && value.length > 0,
    price: (value) => typeof value === 'number' && value > 0,
    category: (value) => ['Electronics', 'Clothing', 'Books'].includes(value),
};
