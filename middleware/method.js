const Items = require("../models/items");

let method = {};

// GET CURRENT DATE
method.currentDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if(month.toString().length === 1) {
        month = `0${month}`;
    }

    if(day.toString().length === 1) {
        day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
}

// GET ESTIMATED DELIVERY DATE
method.estimatedDelivery = () => {
    const early = new Date();
    const late = new Date();

    early.setDate(early.getDate() + 2);
    late.setDate(late.getDate() + 5);

    const months = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September"
    }

    const earlyMonth = months[early.getMonth() + 1];
    const earlyDate = early.getDate();

    const lateMonth = months[late.getMonth() + 1];
    const lateDate = late.getDate();

    return `${earlyMonth} ${earlyDate} - ${lateMonth} ${lateDate}`;
}

// UPDATE STOCKS
method.updateStocks = async (orders) => {
    for(let order of orders.orders) {
        await Items.findByIdAndUpdate(
            order.item,
            [{$set: {stocks: {$subtract: ["$stocks", order.quantity]}}}]
        );
    }
}

// CALCULATE SUBTOTAL
method.calculateSubtotal = (orders) => {
    let subtotal = 0;

    for(let order of orders.orders) {
        subtotal += order.price * order.quantity;
    }

    return subtotal;
}

module.exports = method;