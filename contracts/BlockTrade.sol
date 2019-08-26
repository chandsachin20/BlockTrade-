pragma solidity^0.5.0;

contract BlockTrade {
	uint public propertyCount = 0;

	struct Owner {
		uint ownerId;
		string ownerName;
		uint buyingPrice;
		uint regDateTime;
	}

	struct Property {
		uint propertyId;
		uint registrationNo;
		string description;
		/* Owner[] owners; */
		uint ownerCount;
		mapping (uint => Owner) owners;
	} //Property pt;

	mapping (uint => Property) public properties;

	constructor() public {
		addProperty(104000, "Prakash Raj", 2250000, "Type:3BHk house with garden. Location : Dharampur. ");
		addProperty(105000, "Shardul Aswal", 1500000, "Type:2BHK Flat. Located at Raipur");
		addProperty(106000, "Sandeep Chand", 245000, "Type:3BHk house with flat. Location : Dharampur.");
		addProperty(107000, "Samarth Chauhan", 320000, "Type:Property.Dimension: 50*60 ft. Location : Rishikesh.");
		transferProperty(3,"sachin",2000000);
		transferProperty(3,"sandeep",2100000);
		transferProperty(3,"varun",2200000);
		transferProperty(3,"arvind",2300000);

	}

	function transferProperty(uint _propertyId, string memory _newOwnerName, uint _buyingPrice) public {
		Property storage p = properties[_propertyId];
		p.ownerCount++;
		uint _dateTime = now;
		p.owners[p.ownerCount] = Owner(p.ownerCount, _newOwnerName, _buyingPrice, _dateTime);
	}

	function addProperty(uint _registrationNo, string memory _ownerName, uint _buyingPrice, string memory _description) public {
		propertyCount++;
		properties[propertyCount] = Property(propertyCount, _registrationNo, _description, 1);
		Property storage p = properties[propertyCount];
		uint _dateTime = now;
		p.owners[p.ownerCount] = Owner(p.ownerCount, _ownerName, _buyingPrice, _dateTime);
	}

	function getOwner(uint _propertyId, uint _ownerId) public view returns (uint, string memory, uint, uint) {
		Owner memory o = properties[_propertyId].owners[_ownerId];
		return (o.ownerId, o.ownerName, o.buyingPrice, o.regDateTime);
	}


}
