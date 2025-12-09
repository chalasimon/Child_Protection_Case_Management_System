import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Grid, Paper, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { Shield, People, Gavel } from '@mui/icons-material';
import { motion } from 'framer-motion';
import shadows from '@mui/material/styles/shadows';

const AnimatedTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#102a43',
    color: 'white',
    boxShadow: theme.shadows[1],
    fontSize: 14,
    borderRadius: '8px',
    padding: '8px 16px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#102a43',
  },
}));

const LandingPage = () => {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(180deg, #e0f7fa 0%, #ffffff 100%)', // Gradient background
      color: '#333',
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <Box 
        component={motion.div}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          p: 2, 
          bgcolor: 'lightblue', 
          color: '#102a43', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <AnimatedTooltip 
          title="Child Abuse Protection Case Management System"
          arrow
          placement="bottom-start"
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
          enterDelay={500}
          leaveDelay={200}
          componentsProps={{
            tooltip: {
              sx: {
                transition: 'opacity 0.2s, transform 0.2s',
                '&[data-popper-placement*="bottom"]': {
                  transformOrigin: 'top center',
                },
                 '&.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
                  transform: 'scale(0.95)',
                  opacity: 0,
                },
                '&.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom.Mui-visible': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            },
          }}
        >
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}>
            CAPCMS
          </Typography>
        </AnimatedTooltip>
        <Button 
          variant="outlined" 
          color="primary" 
          component={Link} 
          to="/login"
          sx={{
            borderColor: '#3b82f6',
            color: '#3b82f6',
            '&:hover': {
              backgroundColor: '#3b82f6',
              color: 'white',
            }
          }}
        >
          Login
        </Button>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 6, md: 12 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 'bold', color: '#102a43' }}
          >
            Protecting Our Future, Together
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Typography variant="h5" color="#486581" paragraph>
            A modern, centralized system for managing child protection cases with efficiency and care.
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/login" 
            sx={{ 
              mt: 4, 
              bgcolor: '#3b82f6',
              '&:hover': {
                bgcolor: '#2563eb',
              },
              padding: '12px 30px',
              fontSize: '1rem'
            }}
          >
            Access Secure Portal
          </Button>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'lightblue', py: { xs: 6, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} >
            {[
              { icon: <Shield sx={{ fontSize: 60, color: '#3b82f6'}} />, title: 'Secure Case Management', text: 'End-to-end encrypted and secure handling of all sensitive case data.' },
              { icon: <People sx={{ fontSize: 60, color: '#3b82f6' }} />, title: 'Collaborative Platform', text: 'Enables social workers, law enforcement, and legal teams to work together seamlessly.' },
              { icon: <Gavel sx={{ fontSize: 60, color: '#3b82f6' }} />, title: 'Streamlined Reporting', text: 'Generate comprehensive reports for legal proceedings and case reviews with ease.' }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Paper 
                    component={motion.div}
                    whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                    sx={{ p: 4, textAlign: 'center', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  >
                    {feature.icon}
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: '600', color: '#102a43' }}>{feature.title}</Typography>
                    <Typography sx={{ color: '#486581', mt: 1 }}>{feature.text}</Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 4, mt: 4, bgcolor: 'transparent', textAlign: 'center' }}>
        <Typography variant="body2" color="#627d98">
          © {new Date().getFullYear()} CAPCMS. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;