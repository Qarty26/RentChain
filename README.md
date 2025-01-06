To run:


make sure you have npm: npm -v

npm install <br>
npx hardhat node <br>

npx hardhat run scripts/deploy.js --network localhost (in another terminal, so that it connects to the local blockchain network) <br>

open another terminal and then: <br>
cd frontend <br>
npm run dev


## Partea 1: Implementarea smart-contractelor
---
### Cerinte obligatorii:
- utilizarea tipurilor de date specifice Solidity (mappings, address).

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/Property.sol#L10-L22

- înregistrarea de events.

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/Property.sol#L28-L30

- utilizarea de modifiers.

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/Owner.sol#L10-L13

- exemple pentru toate tipurile de funcții (external, pure, view etc.)

https://github.com/Qarty26/RentChain/blob/adde26ea66f692dd60f803b629b3c6d6fd2356d8/contracts/Property.sol#L39-L121

- exemple de transfer de eth.

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/Property.sol#L97-L107

- ilustrarea interacțiunii dintre smart contracte.

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/Property.sol#L24-L26

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/Property.sol#L56-L58

- deploy pe o rețea locală sau pe o rețea de test Ethereum.

```
npx hardhat node
npx hardhat run ./scripts/deploy.js --localhost

or

npx hardhat run ./scripts/deploy3.js --network sepolia
```


### Cerinte optionale:
- utilizare librării

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/NFT.sol#L7

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/NFT.sol#L32

- implementarea de teste (cu tool-uri la alegerea echipelor).

```
npx hardhat test
```

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/test/Test.js#L1-L236

- implementarea de standarde ERC

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/NFT.sol#L7

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/NFT.sol#L32

- utilizarea de Oracles

https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/PropertyOracles.sol#L8
https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/PropertyOracles.sol#L28
https://github.com/Qarty26/RentChain/blob/9c32606d0dd76852a2560ec288410857f6bf0c1b/contracts/PropertyOracles.sol#L41-L44


## Partea 2: Interacțiunea cu blockchain printr-o aplicație web3.
---

### Cerinte obligatorii:
- Utilizarea unei librării web3 (exemple web3 sau ethersjs) și conectarea cu un Web3 Provider pentru accesarea unor informații generale despre conturi (adresa, balance).

https://github.com/Qarty26/RentChain/blob/b5406003e0c66c09e65e2eacc6b20c0c2b39a097/scripts/ethersUtils.js#L1-L4

- Inițierea tranzacțiilor de transfer sau de apel de funcții, utilizând clase din
librăriile web3.

https://github.com/Qarty26/RentChain/blob/b5406003e0c66c09e65e2eacc6b20c0c2b39a097/frontend/src/App.vue#L54-L84

### Cerinte optionale:
- Control al stării tranzacțiilor (tratare excepții)

https://github.com/Qarty26/RentChain/blob/7d90535df6eb8a0214504db789e79e8b569694ce/frontend/src/App.vue#L109-L139


- Analiza gas-cost (estimare cost și fixare limită de cost).

https://github.com/Qarty26/RentChain/blob/7d90535df6eb8a0214504db789e79e8b569694ce/scripts/deploy2.js#L14-L16

https://github.com/Qarty26/RentChain/blob/7d90535df6eb8a0214504db789e79e8b569694ce/scripts/deploy2.js#L24-L26
  
https://github.com/Qarty26/RentChain/blob/7d90535df6eb8a0214504db789e79e8b569694ce/scripts/deploy2.js#L34-L36
  
https://github.com/Qarty26/RentChain/blob/7d90535df6eb8a0214504db789e79e8b569694ce/scripts/deploy2.js#L54


