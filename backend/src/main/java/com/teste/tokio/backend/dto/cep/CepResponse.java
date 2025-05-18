package com.teste.tokio.backend.dto.cep;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CepResponse(
        String cep,
        String logradouro,
        String complemento,
        String bairro,
        @JsonProperty("localidade") String cidade,
        @JsonProperty("uf") String estado,
        @JsonProperty("erro") Boolean error
) {}
