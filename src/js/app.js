App = {
  webProvider: null,
  contracts: {},
  account: '0x0',

  init: function () {
    return App.initWeb();
  },
  initWeb: function () {
    // if an ethereum provider instance is already provided by metamask
    const provider = window.ethereum
    if (provider) {
      // currently window.web3.currentProvider is deprecated for known security issues.
      // Therefore it is recommended to use window.ethereum instance instead
      App.webProvider = provider;
    }
    else {
      $("#loader-msg").html('No metamask ethereum provider found')
      console.log('No Ethereum provider')
      // specify default instance if no web3 instance provided
      App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Missing.json", function (missing) {
      // instantiate a new truffle contract from the artifict
      App.contracts.Missing = TruffleContract(missing);
      // connect provider to interact with contract
      App.contracts.Missing.setProvider(App.webProvider);
      App.listenForEvents();
      return App.render();
    })
  },

  render: async function () {
    let missingInstance;
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();
    // load account data
    if (window.ethereum) {
      try {
        // recommended approach to requesting user to connect mmetamask instead of directly getting the accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts;
        $("#accountAddress").html("Your Account: " + App.account);
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
          console.warn('user rejected')
        }
        $("#accountAddress").html("Your Account: Not Connected");
        console.error(error);
      }
    }
    //load contract ddata
    App.contracts.Missing.deployed()
      .then(function (instance) {
        missingInstance = instance;
        return missingInstance.missing_persons_count();
      })
      .then(function (missing_persons_count) {
        var candidateResults = $("#candidateResults");
        candidateResults.empty();
        var candidatesSelect = $("#candidatesSelect");
        candidatesSelect.empty();
        var division_order = $("#division_order");
        division_order.empty();
        var mean = $("#mean");
        mean.empty();

        var division_name = ["Dhaka", "Sylhet", "Khulna", "Barisal", "Mymensingh", "Rangpur", "Rajshahi", "Chattogram"];
        var division_count = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 1; i <= missing_persons_count; i++) {
          missingInstance.missing_persons(i)
            .then(function (missing_person) {
              const [name, age, height, description, division, contact] = missing_person;
              var candidateTemplate = "<tr><th>" + name + "</th><td>" + age + "</td><td>" + height + "</td><td>" + description + "</td><td>" + division + "</td><td>" + contact + "</td></tr>"
              candidateResults.append(candidateTemplate);

              division_count[division_name.indexOf(missing_person[4])]++;
              if (i == missing_persons_count) {              
                // Sort division_count in ascending order
                division_count.sort(function(a, b) {
                  return a - b;
                });
                
                // Create a comma-separated string of non-zero elements in division_count
                const arr = division_count.filter(el => el !== 0);
                const new_arr = arr.join(', ');

              
                // Append division order and median to their respective elements
                division_order.append(new_arr);
              
                var n = arr.length;
                if (n % 2 === 0) {
                  var median = (arr[n / 2 - 1] + arr[n / 2]) / 2;
                } else {
                  var median = arr[(n - 1) / 2];
                }
                mean.append("Median = " + median);
              

              }
              
              // render results

            });
        }
        return missingInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        // don't allow user to vote
        if (hasVoted) {
          $("form").hide()
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error)
      });
  },
  // casting vote
  castVote: function () {
    let name = $("#name").val();
    let age = $("#age").val();
    let height = $("#height").val();
    let description = $("#description").val();
    let division = $("#division").val();
    let contact = $("#contact").val();
    App.contracts.Missing.deployed()
      .then(function (instance) {
        console.log(instance)
        return instance.update(name, age, height, description, division, contact, { from: App.account[0] })
      })
      .then(function (result) {
        // wait for voters to update vote
        console.log({ result })
        // content.hide();
        // loader.show();
      })
      .catch(function (err) {
        console.error(err)
      })
  },
  //sort by division
  sort: function () {
    let search_by_division = $("#search_division").val();
    App.contracts.Missing.deployed()
      .then(function (instance) {
        missingInstance = instance;
        return missingInstance.missing_persons_count();
      })
      .then(function (missing_persons_count) {
        var candidateResults = $("#candidateResults");
        candidateResults.empty();
        for (let i = 1; i <= missing_persons_count; i++) {
          missingInstance.missing_persons(i)
            .then(function (missing_person) {
              if (missing_person[4] !== search_by_division) return;

              const [name, age, height, description, division, contact] = missing_person;
                // render results
              var candidateTemplate = "<tr><th>" + name + "</th><td>" + age + "</td><td>" + height + "</td><td>" + description + "</td><td>" + division + "</td><td>" + contact + "</td></tr>"
              candidateResults.append(candidateTemplate);
              
            });
        }
        return missingInstance.voters(App.account)
      })
      .then(function (hasVoted) {
        // don't allow user to vote
        if (hasVoted) {
          $("form").hide()
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error)
      });
  },
  // voted event
  listenForEvents: function () {
    App.contracts.Missing.deployed()
      .then(function (instance) {
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: "latests"
        })
          .watch(function (err, event) {
            console.log("Triggered", event);
            // reload page
            App.render()
          })
      })
  }
}

$(function () {
  $(window).load(function () {
    App.init();
  });
});