// Get the current Domain
var domain = window.location.hostname;
domain = domain.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0];

// fetch from firebase database
chrome.runtime.sendMessage({ command: "fetch", data: { domain: domain } }, (response) => {
    //reponse from the database (background.html > firebase.js)
    parseCoupons(response.data, domain);
});

// send to firebase database
var submitCoupon = function (code, desc, domain) {
    console.log('Submit coupon', { code: code, desc: desc, domain: domain });
    chrome.runtime.sendMessage({ command: "post", data: { code: code, desc: desc, domain: domain } }, (response) => {
        submitCoupon_callback(response.data, domain);
    });
}

// function to send to the database
var submitCoupon_callback = function (response, domain) {
    console.log('Response: ' + response);
    document.querySelector('._submit-overlay').style.display = 'none';
    alert('Coupon Submitted!');
}

// function that recievs information from firebase and displays it
var parseCoupons = function (coupons, domain) {

    try {
        var couponHTML = '';

        for (var key in coupons) {
            var coupon = coupons[key];
            couponHTML += '<li><span class="code"> ' + coupon.code + ' </span>'
                + '<p class="description"> ➡ ' + coupon.description + '</p></li>'
        };

        if (couponHTML == '') {
            couponHTML = '<p class="beFirst">Be the first to submit a coupon to this site.</p>'
        }

        // coupon code being appended to the domains HTML
        var couponDisplay = document.createElement('div');
        couponDisplay.className = '_coupon__list';
        couponDisplay.style.display = 'none';
        couponDisplay.innerHTML = '<h1>Coupons</h1>'
            + '<div class="submit-button">Submit A Coupon</div>'
            + '<p style="padding-top:40px;">Browse coupons that have been used for <strong>' + domain + '</strong></p>'
            + '<p style="font-style:italic;  padding-top:10px;">'
            + 'Click any coupon to copy to clipboard</p>'
            + '<ul>' + couponHTML + '</ul>';
        document.body.appendChild(couponDisplay);

        // make a button on the top of the website to reveil available coupon codes
        var couponButton = document.createElement('div');
        couponButton.className = '_coupon__button';
        couponButton.innerHTML = '<h1>C</h1>';
        document.body.appendChild(couponButton);

        // option for user to submit a coupon
        var couponSubmitOverlay = document.createElement('div');
        couponSubmitOverlay.className = '_submit-overlay';
        couponSubmitOverlay.innerHTML = '<span class="close">(x) close</span>'
            + '<h3>Do you have a coupon for this site?</h3>'
            + '<div> <label>Code:</label> <input type="text" class="discount-code"/> </div>'
            + '<div> <label>Descrition</label> <input type="text" class="desc"/> </div>'
            + '<div> <button type="button" class="submit-coupon">Submit Coupon</button> </div>';
        couponSubmitOverlay.style.display = 'none';
        document.body.appendChild(couponSubmitOverlay);

        // call function when coupon button is clicked
        createEvents();

    } catch (e) {
        console.log('No coupons found for this domain. ', e);
    }
}

// copy discount code to clipboard
var copyToClipboard = function (str) {
    var input = document.createElement('textarea');
    input.innerHTML = str;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

// function that activates coupon button 
var createEvents = function () {

    //
    document.querySelector('._submit-overlay .close').addEventListener('click', function (event) {
        document.querySelector('._submit-overlay').style.display = 'none';
    });


    // event to copy string to clipboard
    document.querySelectorAll('._coupon__list .code').forEach(codeItem => {
        codeItem.addEventListener('click', event => {
            var codeStr = codeItem.innerHTML;
            copyToClipboard(codeStr);
        })
    })


    // user gets to add a coupon
    document.querySelector('._coupon__list .submit-button').addEventListener('click', function (event) {
        document.querySelector('._submit-overlay').style.display = 'block';
    });


    // listener for when user submits coupon
    document.querySelector('._submit-overlay .submit-coupon').addEventListener('click', function (event) {
        var code = document.querySelector('._submit-overlay .discount-code').value;
        var desc = document.querySelector('._submit-overlay .desc').value;
        submitCoupon(code, desc, window.domain);
    });

    // event listener for the coupon icon
    document.querySelector('._coupon__button').addEventListener('click', function (event) {
        if (document.querySelector('._coupon__list').style.display == 'block') {
            document.querySelector('._coupon__list').style.display = 'none';
        }
        else {
            document.querySelector('._coupon__list').style.display = 'block';
        }
    });
}