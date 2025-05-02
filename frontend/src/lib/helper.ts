export const formatCurrency = (value: string | number, format: boolean = true) => {
    // Convert to string if it's a number
    const strValue = typeof value === 'number' ? value.toString() : value;
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart] = strValue.split('.');
    
    // Format integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const dollarString = format ? ' $' : ''; 
    
    // Combine with decimal part (if exists)
    return `${dollarString} ${formattedInteger}${decimalPart ? `.${decimalPart}` : ''}`;
};
