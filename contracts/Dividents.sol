pragma solidity >=0.4.24;

import "./SecurityToken.sol";
import "./dex/Governance.sol";

///@title Dividents for bonds security token
contract Dividents is Governance {
    using SafeMath for uint256;
    //map user->token->config
    mapping(address => mapping(address => Config)) public dvDetails;
    uint256 public INTREVAL = 1 weeks;
    ///config struct of dividents
    struct Config {
        address token;
        uint256 periods;//total periods
        uint256 periodIndex;//current period.start form 0.
        uint256 claimed;//total claimed
        uint256 toClaim;//calculated
        uint256 percent;//percent of profit.
        uint256 start;//start time of new config
    }

    ///@dev config
    function config(address _token, uint256 _periods, uint256 _percent) public onlyOwner returns (bool){
        Config memory cf = Config({
            token : _token,
            periods : _periods,
            periodIndex : 0,
            claimed : 0,
            toClaim : 0,
            percent : _percent,
            start : block.timestamp
            });
        calculateNextDvd(msg.sender, cf);
        dvDetails[msg.sender][_token] = cf;
    }

    ///@dev calculate the next period of dividents and reset the config
    ///@param _user user address
    ///@param _config config of user
    function calculateNextDvd(address _user, Config _config) internal view{
        require(_config.periods > _config.periodIndex, "periods end");
        uint256 balance = SecurityToken(_config.token).balanceOf(_user);
        _config.toClaim += balance.mul(_config.percent).div(100);
        _config.periodIndex += 1;
    }

    ///@dev claim dividents
    ///@param _token token to claim
    function claim(address _token){
        Config memory cf = dvDetails[msg.sender][_token];
        require(block.timestamp.sub(cf.start) > INTREVAL, "still in old period,please wait.");
        require(cf.toClaim > 0, "nothing to claim.");
        uint256 amount = cf.toClaim;
        cf.claimed += amount;
        cf.toClaim = 0;
        calculateNextDvd(msg.sender, cf);

        require(SecurityToken(_token).transfer(msg.sender, amount), "do transfer token errors");
    }
}
