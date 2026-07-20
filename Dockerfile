FROM node:24.16.0

RUN wget https://go.dev/dl/go1.26.4.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.26.4.linux-amd64.tar.gz
RUN rm go1.26.4.linux-amd64.tar.gz
ENV PATH="$PATH:/usr/local/go/bin:~/go/bin"
RUN wget https://github.com/tinygo-org/tinygo/releases/download/v0.41.1/tinygo_0.41.1_amd64.deb
RUN dpkg -i tinygo_0.41.1_amd64.deb
RUN rm tinygo_0.41.1_amd64.deb

CMD ["npm", "run", "dev", "--", "--host"] 
