package com.teste.tokio.backend.service.interfaces;

import com.teste.tokio.backend.dto.user.UserCreateDTO;
import com.teste.tokio.backend.dto.user.UserDTO;
import com.teste.tokio.backend.dto.user.UserUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IUserService {
    UserDTO create(UserCreateDTO dto);
    Page<UserDTO> list(Pageable page);
    UserDTO getById(Long id);
    UserDTO update(Long id, UserUpdateDTO dto);
    void delete(Long id);
}
