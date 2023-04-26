export default class Backend {

    constructor(apiurl, ...params) {
        this.apiurl = apiurl;
        if (params.length === 0)
            this.setWaiting = waiting => {
                // TODO: Need to remember what the previous cursor was!
                const cursor = waiting ? "progress" : "pointer";
                document.body.style.cursor = cursor;
                return waiting;
            }
        else
            this.setWaiting = params[0];
    }

    toQuery(nameAndValuePairs) {
        const urlSearchParams = new URLSearchParams();
        nameAndValuePairs.forEach(nameAndValue => urlSearchParams.append(nameAndValue[0], nameAndValue[1]));
        const query = urlSearchParams.toString()
        return query.length === 0 ? "" : ("?" + query);
    }
    
    toRequest(command, ...nameAndValuePairs) {
        // console.log("nameAndValuePairs:", nameAndValuePairs);
        const query = this.toQuery(nameAndValuePairs)
        const request = `${this.apiurl}/${command}/${query}`;
        console.log("request:", request);
        return request;
    }

    fetchThen(request, operation) {
        this.setWaiting(true);
        fetch(request)
            .then(response => response.json())
            .then(response => {
                console.log("response:", response)
                operation(response)
            })
            .then(() => this.setWaiting(false))
    }

    fetch(request) {
        this.fetchThen(request, response => response);
    }
}
