App = {
  contracts: {},
  clicked: 1,
  clicked2: 1,

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
    console.log("Account Loaded : ", App.account)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const blocktrade = await $.getJSON('BlockTrade.json')
    App.contracts.BlockTrade = TruffleContract(blocktrade)
    App.contracts.BlockTrade.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.blocktrade = await App.contracts.BlockTrade.deployed()
    console.log("Contract loaded")
  },

  render: async () => {

    $('#account').html(App.account)

    App.bindEvents()

  },


  bindEvents: function() {
    $(document).on('click', '#btn-AddProp', App.addProperty)
    $(document).on('click', '#btn-searchProp', App.searchProperty)
    $(document).on('click', '#btn-propHistory', App.showPropertyHistory)
    $(document).on('click', '#btn-verifyProp', App.verifyProperty)
    $(document).on('click', '#btn-propHistory_', App.showPropertyHistory_)
    $(document).on('click', '#btn-TransferProp', App.transferProperty)
    },

 addProperty: async (event) => {
   console.log("Adding new Property")
   event.preventDefault()
   const regNo = $('#RegNo').val()
   const ownerName = $('#OwnerName').val()
   const propVal = $('#PropVal').val()
   const propDesc = $('#PropDesc').val()

   if(regNo == "" || ownerName == "" || propVal == "" || propDesc == "")
   {
     alert("Fill all the fields...")
   }
   else {
   if(await App.alreadyRegistered(regNo))
   {
     console.log("Registration no. already registered")
     alert("Property with registrationNo. \'" + regNo + "\' is already registred")
     $('#RegNo').val("")
   }
   else
   {
   await App.blocktrade.addProperty(regNo, ownerName, propVal, propDesc)
   console.log("Succesfully added new property with registration No. \'" + regNo + "\'")
   alert("Successfully added new property with registration No. \'" + regNo + "\'")
   $('#RegNo').val("")
   $('#OwnerName').val("")
   $('#PropVal').val("")
   $('#PropDesc').val("")
  }
  }
 },

 alreadyRegistered: async (regNo) => {
   var propertyCount = await App.blocktrade.propertyCount()
   propertyCount = propertyCount.toNumber()
   var found = false
   for(var i=1; i<=propertyCount; i++)
   {
     var property = await App.blocktrade.properties(i)
     var rNo = await property[1].c[0]
     if(regNo == rNo)
     {
       found = true
       break;
     }
   }
   return found
 },


 searchProperty: async (event) => {
   console.log("Searching Property")
   // App.setLoading(true)
   event.preventDefault()
   const regNo = $('#searchProp').val()

   if(regNo == "")
   {
     alert("Enter Property Registration Number...");
   }
   else {
   var propertyCount = await App.blocktrade.propertyCount()
   propertyCount = propertyCount.toNumber()
   var found = false
   var property
   for(var i=1; i<=propertyCount; i++)
   {
     property = await App.blocktrade.properties(i)
     var rNo = await property[1].c[0]
     if(regNo == rNo)
     {
       found = true
       break;
     }
   }

   $('#table-propHistory').find('#ownerTemplate').remove()
   $('#table-propHistory').hide()
   App.clicked = 1
   if(!found)
   {
     $('#propResult').hide()
     //$('#propHistoryList').hide()

     console.log("No Property with registration no. \'" +regNo + "\'")
     alert("No Property with registration no. \'" +regNo + "\'")
   }
   else
   {
     var owner = await App.blocktrade.getOwner(property[0], property[3])
     App.setPropertyDetails(property, owner)
   }
   }
 },

 setPropertyDetails: (property, owner) => {
   console.log("Property found : " + property)
   console.log("Owner details : " + owner)
   $('#propId').html("" + property[0])
   $('#regNo').html("" + property[1])
   $('#ownerId').html("" + owner[0])
   $('#ownerName').html(owner[1])
   $('#propVal').html("" + owner[2])
   $('#propDesc').html(property[2])
   var regDateTime = new Date(parseInt(owner[3], 10) * 1000)
   $('#regDateTime').html(regDateTime.toLocaleString())
   $('#propResult').show()
 },


 showPropertyHistory: async (event) => {
   event.preventDefault()
   if(App.clicked == 1) {
   App.clicked = 2
   $('#propHistoryList').show()
   const propId = parseInt($('#propId').html(), 10)
   const ownerCount = parseInt($('#ownerId').html(), 10)
   console.log("owner template1 : " + ownerCount + "propId : "+ propId)

   var markupData = '<tbody id="ownerTemplate"> </tbody>'
   $('#table-propHistory').append(markupData)
   for(var i=ownerCount; i>0; i--)
   {
     const owner = await App.blocktrade.getOwner(propId, i)
     console.log("owner : "+owner)
     const ownerId = owner[0].toNumber()
     const ownerName = owner[1]
     const buyingPrice = owner[2].toNumber()
     var regDate = new Date(owner[3].toNumber() * 1000)
     regDate = regDate.toLocaleString()

     var markUp = '<tr > <td > ' + ownerId
     markUp += '</td> <td > ' + ownerName
     markUp += '</td> <td > ' + regDate
     markUp += '</td> <td > ' + buyingPrice + '</td> </tr>'
     $('#ownerTemplate').append(markUp)

     console.log("owner template : "+ownerName + "  " + buyingPrice)
   }


   $('#table-propHistory').show()
   console.log("owner template last : ")
 }
 else if(App.clicked == 2){
   $('#table-propHistory').hide()
   App.clicked = 3
 }
 else if(App.clicked == 3)
 {
   $('#table-propHistory').show()
   App.clicked = 2
 }
 },

 verifyProperty: async (event) => {
   console.log("Verifying Property")
   // App.setLoading(true)
   event.preventDefault()
   const regNo = $('#verifyProp').val()

   if(regNo == "")
   {
     alert("Enter Property Registration Number...");
   }
   else {
   var propertyCount = await App.blocktrade.propertyCount()
   propertyCount = propertyCount.toNumber()
   var found = false
   var property
   for(var i=1; i<=propertyCount; i++)
   {
     property = await App.blocktrade.properties(i)
     var rNo = await property[1].c[0]
     if(regNo == rNo)
     {
       found = true
       break;
     }
   }

   $('#table-propHistory_').find('#ownerTemplate_').remove()
   $('#table-propHistory_').hide()
   App.clicked2 = 1
   if(!found)
   {
     $('#propResult_').hide()
     $('#propHistoryList_').hide()
     $('#propTransferForm').hide()
     console.log("No Property with registration no. \'" +regNo + "\'")
     alert("No Property with registration no. \'" +regNo + "\'")
   }
   else
   {
     var owner = await App.blocktrade.getOwner(property[0], property[3])
     App.setPropertyDetails_(property, owner)
     $('#propTransferForm').show()
   }

   }
 },

 setPropertyDetails_: (property, owner) => {
   console.log("Property found : " + property)
   console.log("Owner details : " + owner)
   $('#propId_').html("" + property[0])
   $('#regNo_').html("" + property[1])
   $('#ownerId_').html("" + owner[0])
   $('#ownerName_').html(owner[1])
   $('#propVal_').html("" + owner[2])
   $('#propDesc_').html(property[2])
   var regDateTime = new Date(parseInt(owner[3], 10) * 1000)
   $('#regDateTime_').html(regDateTime.toLocaleString())
   $('#propResult_').show()
 },

 showPropertyHistory_: async (event) => {
   event.preventDefault()
   if(App.clicked2 == 1) {
   App.clicked2 = 2
   $('#propHistoryList_').show()
   const propId = parseInt($('#propId_').html(), 10)
   const ownerCount = parseInt($('#ownerId_').html(), 10)
   console.log("owner template1 : " + ownerCount + "propId : "+ propId)

   var markupData = '<tbody id="ownerTemplate_"> </tbody>'
   $('#table-propHistory_').append(markupData)
   for(var i=ownerCount; i>0; i--)
   {
     const owner = await App.blocktrade.getOwner(propId, i)
     console.log("owner : "+owner)
     const ownerId = owner[0].toNumber()
     const ownerName = owner[1]
     const buyingPrice = owner[2].toNumber()
     var regDate = new Date(owner[3].toNumber() * 1000)
     regDate = regDate.toLocaleString()

     var markUp = '<tr> <td>' + ownerId
     markUp += '</td> <td>' + ownerName
     markUp += '</td> <td>' + regDate
     markUp += '</td> <td>' + buyingPrice + '</td> </tr>'
     $('#ownerTemplate_').append(markUp)

     console.log("owner template : "+ownerName + "  " + buyingPrice)
   }


   $('#table-propHistory_').show()
   console.log("owner template last : ")
 }
 else if(App.clicked2 == 2){
   $('#table-propHistory_').hide()
   App.clicked2 = 3
 }
 else if(App.clicked2 == 3)
 {
   $('#table-propHistory_').show()
   App.clicked2 = 2
 }
 },

 transferProperty: async (event) => {
   console.log("Transferring Property")
   // App.setLoading(true)
   event.preventDefault()
   const newOwnerName = $('#newOwnerName').val()
   const newPropVal = parseInt($('#newPropVal').val(), 10)

   if(newOwnerName == "" || newPropVal == "")
   {
     alert("Fill all the fields...")
   }
   else {
     const propId = parseInt($('#propId_').html(), 10)
     console.log("propId : "+propId + "  newOwnerName : "+newOwnerName+"  newPropVal : "+newPropVal)
     await App.blocktrade.transferProperty(propId, newOwnerName, newPropVal)
     console.log("Succesfully transferred property with registration No. \'" + $('#verifyProp').val() + "\' to " + newOwnerName)
     alert("Succesfully transferred property with registration No. \'" + $('#verifyProp').val() + "\' to " + newOwnerName)
     $('#newOwnerName').val("")
     $('#newPropVal').val("")
     $('#propTransferForm').hide()

     const property = await App.blocktrade.properties(propId)
     const ownerId = parseInt($('#ownerId_').html(), 10)
     const owner = await App.blocktrade.getOwner(propId, ownerId+1)

     App.setPropertyDetails_(property, owner)

     $('#table-propHistory_').find('#ownerTemplate_').remove()
     $('#table-propHistory_').hide()
     App.clicked2 = false

     if($('#propId').html() != "") {
      App.setPropertyDetails(property, owner)
      $('#table-propHistory').find('#ownerTemplate').remove()
      $('#table-propHistory').hide()
      App.clicked = false
    }

   }
 },

}

$(window).on('load', function() {
App.load()
})
