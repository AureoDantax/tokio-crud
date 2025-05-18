package com.teste.tokio.backend.service.interfaces;

import com.teste.tokio.backend.dto.cep.CepResponse;

public interface CepClient {
    CepResponse fetch(String cep);
}
