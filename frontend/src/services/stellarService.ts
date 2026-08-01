import { 
  SorobanRpc, 
  TransactionBuilder, 
  Networks, 
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  BASE_FEE
} from '@stellar/stellar-sdk';
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = Networks.TESTNET;

export class StellarService {
  private escrowContractId: string;
  private reputationContractId: string;

  constructor(escrowContractId: string, reputationContractId: string) {
    this.escrowContractId = escrowContractId;
    this.reputationContractId = reputationContractId;
  }

  async createProject(
    title: string,
    metaHash: string,
    amount: string,
    tokenAddress: string,
    deadline: number
  ) {
    try {
      const publicKey = await getPublicKey();
      const account = await server.getAccount(publicKey);
      
      const contract = new Contract(this.escrowContractId);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(contract.call(
          'create_project',
          Address.fromString(publicKey),
          nativeToScVal(title, { type: 'string' }),
          nativeToScVal(metaHash, { type: 'string' }),
          nativeToScVal(BigInt(Math.round(parseFloat(amount) * 10000000)), { type: 'i128' }),
          Address.fromString(tokenAddress),
          nativeToScVal(BigInt(deadline), { type: 'u64' })
        ))
        .setTimeout(30)
        .build();

      const simulationResponse = await server.simulateTransaction(transaction);
      
      if (SorobanRpc.Api.isSimulationError(simulationResponse)) {
        throw new Error(`Simulation failed: ${simulationResponse.error}`);
      }

      const preparedTransaction = SorobanRpc.assembleTransaction(
        transaction,
        simulationResponse
      );

      const signedXdr = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: networkPassphrase,
        accountToSign: publicKey,
      });

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXdr,
        networkPassphrase
      );

      const response = await server.sendTransaction(signedTransaction);
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async acceptProject(projectId: number) {
    try {
      const publicKey = await getPublicKey();
      const account = await server.getAccount(publicKey);
      
      const contract = new Contract(this.escrowContractId);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(contract.call(
          'accept_project',
          nativeToScVal(BigInt(projectId), { type: 'u64' }),
          Address.fromString(publicKey)
        ))
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, publicKey);
    } catch (error) {
      console.error('Error accepting project:', error);
      throw error;
    }
  }

  async submitWork(projectId: number, workRef: string) {
    try {
      const publicKey = await getPublicKey();
      const account = await server.getAccount(publicKey);
      
      const contract = new Contract(this.escrowContractId);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(contract.call(
          'submit_work',
          nativeToScVal(BigInt(projectId), { type: 'u64' }),
          Address.fromString(publicKey),
          nativeToScVal(workRef, { type: 'string' })
        ))
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, publicKey);
    } catch (error) {
      console.error('Error submitting work:', error);
      throw error;
    }
  }

  async approveAndRelease(projectId: number) {
    try {
      const publicKey = await getPublicKey();
      const account = await server.getAccount(publicKey);
      
      const contract = new Contract(this.escrowContractId);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(contract.call(
          'approve_and_release',
          nativeToScVal(BigInt(projectId), { type: 'u64' }),
          Address.fromString(publicKey)
        ))
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, publicKey);
    } catch (error) {
      console.error('Error approving and releasing funds:', error);
      throw error;
    }
  }

  async getProject(projectId: number) {
    try {
      const contract = new Contract(this.escrowContractId);
      
      const account = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(contract.call(
          'get_project',
          nativeToScVal(BigInt(projectId), { type: 'u64' })
        ))
        .setTimeout(30)
        .build();

      const response = await server.simulateTransaction(transaction);
      
      if (SorobanRpc.Api.isSimulationError(response)) {
        throw new Error(`Simulation failed: ${response.error}`);
      }

      return scValToNative(response.result!.retval);
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  async getReputationScore(userAddress: string) {
    try {
      const contract = new Contract(this.reputationContractId);
      
      const account = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      })
        .addOperation(contract.call(
          'get_score',
          Address.fromString(userAddress)
        ))
        .setTimeout(30)
        .build();

      const response = await server.simulateTransaction(transaction);
      
      if (SorobanRpc.Api.isSimulationError(response)) {
        throw new Error(`Simulation failed: ${response.error}`);
      }

      return scValToNative(response.result!.retval);
    } catch (error) {
      console.error('Error getting reputation score:', error);
      throw error;
    }
  }

  private async submitTransaction(transaction: any, publicKey: string) {
    const simulationResponse = await server.simulateTransaction(transaction);
    
    if (SorobanRpc.Api.isSimulationError(simulationResponse)) {
      throw new Error(`Simulation failed: ${simulationResponse.error}`);
    }

    const preparedTransaction = SorobanRpc.assembleTransaction(
      transaction,
      simulationResponse
    );

    const signedXdr = await signTransaction(preparedTransaction.toXDR(), {
      networkPassphrase: networkPassphrase,
      accountToSign: publicKey,
    });

    const signedTransaction = TransactionBuilder.fromXDR(
      signedXdr,
      networkPassphrase
    );

    return await server.sendTransaction(signedTransaction);
  }
}

// Export singleton instance (contract IDs would be loaded from config)
export const stellarService = new StellarService(
  import.meta.env.VITE_ESCROW_CONTRACT_ID || 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
  import.meta.env.VITE_REPUTATION_CONTRACT_ID || 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KN'
);