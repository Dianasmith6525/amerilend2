import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CreditCard } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
}

interface AdminBankAccountsProps {
  accounts?: BankAccount[];
  onAdd?: () => void;
  onEdit?: (account: BankAccount) => void;
  onDelete?: (accountId: string) => void;
}

/**
 * AdminBankAccounts Component
 * Displays and manages bank accounts for admin use
 */
export const AdminBankAccounts: React.FC<AdminBankAccountsProps> = ({
  accounts = [],
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Bank Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mb-4 opacity-50" />
            <p>No bank accounts configured</p>
            {onAdd && (
              <button
                onClick={onAdd}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Bank Account
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{account.bankName}</p>
                  <p className="text-sm text-gray-600">
                    Account: ****{account.accountNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-600">{account.accountType}</p>
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(account)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(account.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBankAccounts;
