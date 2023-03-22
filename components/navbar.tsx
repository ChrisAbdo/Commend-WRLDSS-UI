import { useState, useEffect } from "react";
import Web3 from "web3";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ConnectWallet from "./connect-wallet";

const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [open, setOpen] = useState(false);

  const [connectedAccount, setConnectedAccount] = useState("");

  useEffect(() => {
    const loadConnectedAccount = async () => {
      const web3 = new Web3(Web3.givenProvider);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setConnectedAccount(accounts[0]);
      }
    };

    loadConnectedAccount();
  }, []);

  const connectWallet = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider);
      const accounts = await web3.eth.requestAccounts();
      setConnectedAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-black sticky top-0 z-50">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <div className="-m-1.5 p-1.5">
            <h1 className="text-2xl font-bold text-white">Commend</h1>
          </div>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-[#111] py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#333]/80"
          >
            Connect Wallet
          </button> */}
          {connectedAccount ? (
            <button
              className="rounded-md bg-[#111] py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#333]/80"
              disabled
            >
              {connectedAccount.slice(0, 5) +
                "..." +
                connectedAccount.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="rounded-md bg-[#111] py-1.5 px-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#333]/80"
            >
              Connect Wallet
            </button>
          )}
          <ConnectWallet
            open={open}
            setOpen={setOpen}
            connectWallet={connectWallet}
          />
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
