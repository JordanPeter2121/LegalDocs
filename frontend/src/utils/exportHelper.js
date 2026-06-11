import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Export to CSV (Bisa dibuka di Excel)
export const exportToCSV = (data, filename = 'data') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let cell = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
        if (typeof cell === 'string' && cell.includes(',')) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'dd-MM-yyyy')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};