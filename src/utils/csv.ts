
export const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            let cell = row[header];
            if (typeof cell === 'object' && cell !== null) {
                cell = JSON.stringify(cell).replace(/"/g, '""');
            } else {
                cell = String(cell).replace(/"/g, '""');
            }
            return `"${cell}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
