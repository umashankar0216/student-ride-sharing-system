package Student_ride_sharing.demand.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private JwtTokenProvider jwtTokenProvider;

    private UserDetailsService userDetailsService;

    JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,UserDetailsService userDetailsService){
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1️ Get header
        String header = request.getHeader("Authorization");

        String token = null;
        String username = null;

        // 2️Extract token
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        // 3️ Validate token
        if (token != null && jwtTokenProvider.validateToken(token)) {

            // 4️ Get username
            username = jwtTokenProvider.getUserNameFromToken(token);

            // 5⃣ Load user
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 6️ Create authentication
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            // 7️ 🔥 Set authentication
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        //  Continue request
        filterChain.doFilter(request, response);
    }
}
