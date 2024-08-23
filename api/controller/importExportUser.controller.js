import { Client, ClientPurchase, ClosingBalance } from "../model/Client.model.js";
function MobileDigite(v) {
  return /\d{10}/.test(v); // Validates a 10-digit mobile number
};
export const importUser = async (req, res) => {
  const { users } = req.body;

  try {
    for (const data of users) {
      const { Type, Name, Address, State, Mobile, 'Closing Balance': ClosingBalanceValue } = data;

      // Check if the client already exists
      const existingUser = await Client.findOne({ Type, Name, Mobile });
      if (existingUser) {
        console.log(`Client ${Name} already present`);
        continue;  // Skip to the next user
      }

      if (!Mobile || !MobileDigite(Mobile)) {
        console.log(`Client ${Name} mobile number not present present`);
        continue;  // Skip to the next user
      }
      const orderDate = new Date();
      const currentMonth = orderDate.toISOString().slice(0, 7);

      // Create new ClosingBalance and ClientPurchase documents
      const closingMonth = await ClosingBalance.create({
        monthYear: currentMonth,
        balance: ClosingBalanceValue || 0,
      });

      const purchaseMonth = await ClientPurchase.create({
        monthYear: currentMonth,
        Purchase: 0,
      });

      // Create the new Client instance
      const client = new Client({
        Type,
        Name,
        Address,
        State,
        Mobile,
        ClosingBalance: [closingMonth],
        CompletePurchase: [purchaseMonth],
        totalClosingBalance: ClosingBalanceValue || 0,
        totalCompletePurchase: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Save the client to the database
      await client.save();
      console.log(`Client ${Name} created successfully`);
    }

    res.status(201).json({ message: 'Clients imported successfully' });
  } catch (error) {
    console.error('Failed to create clients:', error);
    res.status(500).json({ message: 'Failed to create clients', error: error.message });
  }
};
