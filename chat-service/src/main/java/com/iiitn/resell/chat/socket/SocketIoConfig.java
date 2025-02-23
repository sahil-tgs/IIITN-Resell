package com.iiitn.resell.chat.socket;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@org.springframework.context.annotation.Configuration
public class SocketIoConfig {

    @Bean(destroyMethod = "stop")
    public SocketIOServer socketIOServer(
            @Value("${socketio.host}") String host,
            @Value("${socketio.port}") int port) {
        Configuration cfg = new Configuration();
        cfg.setHostname(host);
        cfg.setPort(port);
        cfg.setOrigin("*");
        return new SocketIOServer(cfg);
    }
}
