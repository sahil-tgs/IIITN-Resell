package com.iiitn.resell.chat.socket;

import com.corundumstudio.socketio.SocketIOServer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketIoServerLifecycle {

    private final SocketIOServer server;
    private final ChatSocketHandler handler;

    @PostConstruct
    public void start() {
        handler.register(server);
        server.start();
        log.info("Socket.IO server listening on {}:{}",
                server.getConfiguration().getHostname(),
                server.getConfiguration().getPort());
    }

    @PreDestroy
    public void stop() {
        server.stop();
    }
}
